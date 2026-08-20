import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";

const app: Express = express();

// Production measurements show four Replit-managed hops between this app and
// the true client address. Any caller-supplied X-Forwarded-For entries precede
// those hops, so trusting exactly four hops resolves req.ip to the platform-
// inserted client entry without trusting caller-controlled prefixes.
//
// Preview/dev continues to use its existing single local proxy hop.
app.set("trust proxy", process.env.NODE_ENV === "production" ? 4 : 1);

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
