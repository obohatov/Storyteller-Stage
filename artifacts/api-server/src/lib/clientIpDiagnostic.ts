import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

function fingerprint(value: string, key: string): string {
  return createHmac("sha256", key).update(value).digest("hex").slice(0, 16);
}

function splitForwardedFor(value: string | undefined): string[] {
  return value
    ? value.split(",").map((part) => part.trim()).filter(Boolean)
    : [];
}

function hasMatchingToken(value: string | undefined, expected: string): boolean {
  if (!value) return false;
  const provided = Buffer.from(value);
  const configured = Buffer.from(expected);
  return (
    provided.length === configured.length &&
    timingSafeEqual(provided, configured)
  );
}

/**
 * Short-lived, privacy-safe production probe.
 *
 * It is registered only while RATE_LIMIT_DIAGNOSTIC_TOKEN is set. It never
 * emits raw addresses or forwarded headers: a token holder can compare only
 * HMAC fingerprints from their own controlled requests. Remove this module and
 * the temporary environment variable after the production proxy chain is
 * measured.
 */
export function clientIpDiagnostic(
  req: Request,
  res: Response,
  diagnosticToken: string,
): void {
  if (!hasMatchingToken(req.header("x-rate-limit-diagnostic") ?? undefined, diagnosticToken)) {
    res.status(404).end();
    return;
  }

  const hashKey = process.env.SESSION_SECRET ?? diagnosticToken;
  const rawXff = req.header("x-forwarded-for") ?? undefined;
  const rawForwarded = req.header("forwarded") ?? undefined;
  const rawRealIp = req.header("x-real-ip") ?? undefined;

  res.set("Cache-Control", "no-store").json({
    socket: fingerprint(req.socket.remoteAddress ?? "", hashKey),
    xForwardedFor: splitForwardedFor(rawXff).map((value) => fingerprint(value, hashKey)),
    forwarded: rawForwarded ? fingerprint(rawForwarded, hashKey) : null,
    xRealIp: rawRealIp ? fingerprint(rawRealIp, hashKey) : null,
    expressIp: fingerprint(req.ip ?? "", hashKey),
    expressIps: req.ips.map((value) => fingerprint(value, hashKey)),
  });
}