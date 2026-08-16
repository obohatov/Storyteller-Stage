import type { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * Creates a simple in-memory per-IP rate-limiter middleware.
 * Not suitable for multi-process deployments — use Redis there.
 * For a single-instance personal author site this is sufficient.
 */
export function createRateLimiter(opts: {
  max: number;
  windowMs: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodic cleanup to prevent unbounded memory growth
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, rec] of store.entries()) {
      if (rec.resetAt <= now) store.delete(key);
    }
  }, 60_000);
  // Allow the process to exit even if the interval is still running
  if (cleanup.unref) cleanup.unref();

  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        ?.trim() ??
      req.socket?.remoteAddress ??
      "unknown";

    const now = Date.now();
    const rec = store.get(ip);

    if (!rec || rec.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }

    if (rec.count >= opts.max) {
      res.status(429).json({
        error:
          opts.message ?? "Too many requests. Please try again later.",
      });
      return;
    }

    rec.count++;
    next();
  };
}
