// src/middleware/csrf.middleware.ts
import { Request, Response, NextFunction } from "express";
import { generateCsrfToken } from "../utils/helpers";

const CSRF_COOKIE_NAME = "csrf_token";

// ✅ Step 1: Issue token if not exists
export const csrfTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies[CSRF_COOKIE_NAME];

  if (!token) {
    const newToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, newToken, {
      httpOnly: false, // must be readable by frontend
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  }

  next();
};

// ✅ Step 2: Verify on write requests
export const verifyCsrfMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const csrfCookie = req.cookies[CSRF_COOKIE_NAME];
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  next();
};
