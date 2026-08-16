import type { Request, Response, NextFunction } from "express";

/** Comma-separated list of authorised Replit user IDs set as the ADMIN_USER_IDS secret. */
const RAW = process.env.ADMIN_USER_IDS ?? "";
const ADMIN_IDS: ReadonlySet<string> = new Set(
  RAW.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

/**
 * Returns true when the given userId is in the configured allowlist.
 * If the allowlist is empty (env var not set), NOBODY is an admin.
 */
export function isAdminUser(userId: string): boolean {
  if (ADMIN_IDS.size === 0) return false; // deny all when not configured
  return ADMIN_IDS.has(userId);
}

/**
 * Express middleware that enforces admin-only access.
 *   401 – not authenticated
 *   403 – authenticated but not in the admin allowlist
 *   next() – authorised admin
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = (req.user as { id: string } | undefined)?.id;
  if (!userId || !isAdminUser(userId)) {
    res.status(403).json({ error: "Forbidden: not an authorized administrator" });
    return;
  }
  next();
}
