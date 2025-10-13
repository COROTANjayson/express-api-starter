import * as dotenv from "dotenv";
dotenv.config();

export const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
export const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
export const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;
export const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string;
