import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

// Trust exactly one upstream proxy hop (Replit's reverse proxy).
// This makes req.ip resolve to the real client IP from X-Forwarded-For
// while ignoring any client-supplied X-Forwarded-For values.
app.set("trust proxy", 1);

// ── CORS ─────────────────────────────────────────────────────────────────────
// Explicit allowlist — never reflect the request Origin back unconditionally.
// In production only bohatova.art is allowed.
// In Replit dev the workspace preview domain is also allowed so cross-path
// requests from the preview work during development.
const ALLOWED_ORIGINS = new Set<string>([
  "https://bohatova.art",
  ...(process.env.REPLIT_DEV_DOMAIN
    ? [`https://${process.env.REPLIT_DEV_DOMAIN}`]
    : []),
]);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Same-origin requests have no Origin header — always allow.
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

export default app;
