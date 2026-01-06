import * as dotenv from "dotenv";
dotenv.config();

export const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
export const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
export const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;
export const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string;

export const REDIS_URL = process.env.REDIS_URL;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
export const PORT = process.env.PORT;

export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME || "refresh_cookie";
export const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "csrf_token";
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || false;
export const COOKIE_SAME_SITE =
  (process.env.COOKIE_SAME_SITE as "none" | "lax" | "strict") || "none";
export const CSRF_SECRET = process.env.CSRF_SECRET || "csrf-secret-key";
