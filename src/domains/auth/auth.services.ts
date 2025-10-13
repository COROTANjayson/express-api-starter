import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
// import Redis from "ioredis";
import { generateHash, generateToken } from "../../utils/helpers";
import UserRepository from "../user/user.repository";
import { LoginInput, RegisterInput } from "./auth.types";
import { AppError } from "../../utils/app-error";
import {
  ACCESS_EXPIRES,
  ACCESS_SECRET,
  REFRESH_EXPIRES,
  REFRESH_SECRET,
} from "../../utils/config";

// Optional Redis client (if you want stateful refresh tokens / caching)
// const redisUrl = process.env.REDIS_URL;
// const redis = redisUrl ? new Redis(redisUrl) : null;

export default class AuthService {
  private userRepo = new UserRepository();

  // Register
  async register(data: RegisterInput) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new AppError("Email already registered", 409);

    const hashed = await generateHash(data.password);
    const user = await this.userRepo.create({ ...data, password: hashed });
    const login = await this.login({
      email: user.email,
      password: data.password,
    });
    // const token = await this.generateTokens({
    return {
      id: user.id,
      email: user.email,
      ...login,
    };
  }

  // Login
  async login({ email, password }: LoginInput) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new AppError("Email does not exists", 404);
    console.log("password", password);
    console.log("user.password", user.password);
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppError("Invalid credentials", 400);

    const jti = uuidv4();
    await this.userRepo.update(user?.id, { currentTokenId: jti });

    const payload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = generateToken(payload, ACCESS_SECRET, ACCESS_EXPIRES);
    const refreshToken = generateToken(
      { ...payload, jti },
      REFRESH_SECRET,
      REFRESH_EXPIRES
    );

    return { accessToken, refreshToken };
  }

  // Refresh token
  async refresh(token: string) {
    try {
      const userData: any = jwt.verify(token, REFRESH_SECRET);
      const userId = userData.id;
      const tokenJti = userData.jti;

      const user = await this.userRepo.findById(userId);
      if (!user) throw new AppError("Invalid token (user not found)", 404);

      if (user.currentTokenId !== tokenJti) {
        throw new AppError("Refresh token revoked or already used", 409);
      }
      const payload = {
        id: user.id,
        email: user.email,
      };

      const nextJti = uuidv4();
      await this.userRepo.update(userId, { currentTokenId: nextJti });
      const accessToken = generateToken(payload, ACCESS_SECRET);
      const refreshToken = generateToken(
        { ...payload, jti: nextJti },
        REFRESH_SECRET,
        REFRESH_EXPIRES
      );

      // Strategy B (stateful): verify token matches Redis stored token
      // if (redis) {
      //   const stored = await redis.get(`refresh:${userId}`);
      //   if (!stored || stored !== token) throw new Error('Invalid refresh token');
      //   // issue new token and store it
      //   await redis.set(`refresh:${userId}`, newRefreshToken, 'EX', 60*60*24*7);
      // }
      return { accessToken, refreshToken };
    } catch (err: any) {
      throw new AppError("Invalid refresh token: " + err.message, 404);
    }
  }

  async logout(token: string) {
    try {
      const payload: any = jwt.verify(token, REFRESH_SECRET);
      const userId = payload.id;
      const tokenJti = payload.jti;

      const user = await this.userRepo.findById(userId);
      if (!user) throw new Error("User not found");

      if (user.currentTokenId === tokenJti) {
        await this.userRepo.update(userId, { currentTokenId: null });
      }
    } catch {
    }
  }
}
