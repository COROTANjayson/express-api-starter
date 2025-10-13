import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const generateToken = (
  payload: any,
  secret: string,
  expiresIn: any = "1d"
) => {
  return jwt.sign(payload, secret, { expiresIn });
};
export const generateHash = (password: string) => {
  return bcrypt.hash(password, 10);
};
export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
