import { Request, Response, NextFunction } from "express";
import { generateCsrfToken } from "../utils/helpers";
import { COOKIE_SAME_SITE, CSRF_COOKIE_NAME } from "../utils/config";

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
      sameSite: COOKIE_SAME_SITE,
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
