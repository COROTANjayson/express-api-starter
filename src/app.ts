import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authRouter } from "./domains/auth/auth.routes";
import { usersRouter } from "./domains/user/user.routes";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import {
  csrfTokenMiddleware,
  verifyCsrfMiddleware,
} from "./middlewares/csrfMiddleware";

// import csrf from 'csurf';
// https://chatgpt.com/c/68eb9870-0f28-8321-89fb-b3f88308208d <- csrf
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Default: 100 requests per 15 minutes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// 🔹 Generate token automatically on first visit
app.use(csrfTokenMiddleware);
// 🔹 Verify token on state-changing methods
app.use(verifyCsrfMiddleware);

// 🔹 Public route (just to get CSRF token)
app.get("/csrf-token", (req, res) => {
  res.json({ message: "CSRF token set in cookie" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);

// Auto-issue CSRF token cookie if missing
app.use(csrfTokenMiddleware);
// export const csrfProtection = csrf({ cookie: true });

app.get("/", (_req, res) =>
  res.json({ ok: true, message: "Express TypeScript Domain Backend" })
);

export default app;
