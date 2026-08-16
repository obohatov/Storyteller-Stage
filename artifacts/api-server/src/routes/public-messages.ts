import { Router, type IRouter, type Request, type Response } from "express";
import sanitizeHtml from "sanitize-html";
import { and, eq } from "drizzle-orm";
import { db, messagesTable, playsTable, playTranslationsTable } from "@workspace/db";
import { sendContactEmail, sendScriptRequestEmail } from "../lib/email";
import { createRateLimiter } from "../lib/rateLimit";

const router: IRouter = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Strip all HTML tags from user input; used for plain-text fields. */
const clean = (s: unknown): string =>
  sanitizeHtml(String(s ?? ""), { allowedTags: [], allowedAttributes: {} }).trim();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (s: string) => EMAIL_RE.test(s);

const VALID_LOCALES = new Set(["en", "uk", "ru", "nl"]);
const CONTACT_CATEGORIES = new Set([
  "general", "publishing", "translation", "festival", "collaboration", "reader", "other",
]);
const INTENDED_USE_OPTIONS = new Set([
  "reading", "production", "festival", "publishing", "translation", "education", "other",
]);

/** 5 submissions per IP per 15 minutes */
const submissionLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

// ── POST /api/contact ─────────────────────────────────────────────────────────

router.post("/contact", submissionLimiter, async (req: Request, res: Response): Promise<void> => {
  const body = req.body ?? {};

  // Honeypot: non-empty `website` field → silent discard
  if (body.website) {
    res.json({ ok: true });
    return;
  }

  const locale = String(body.locale ?? "");
  if (!VALID_LOCALES.has(locale)) {
    res.status(400).json({ error: "Invalid locale." });
    return;
  }

  const name           = clean(body.name).slice(0, 200);
  const email          = String(body.email ?? "").toLowerCase().trim().slice(0, 300);
  const message        = clean(body.message).slice(0, 5000);
  const enquiryCategory = String(body.enquiryCategory ?? "").trim();

  const invalid: string[] = [];
  if (!name)                               invalid.push("name");
  if (!isValidEmail(email))                invalid.push("email");
  if (message.length < 10)                 invalid.push("message");
  if (!CONTACT_CATEGORIES.has(enquiryCategory)) invalid.push("enquiryCategory");

  if (invalid.length) {
    res.status(400).json({ error: "Validation failed.", fields: invalid });
    return;
  }

  const [saved] = await db
    .insert(messagesTable)
    .values({ type: "contact", status: "new", locale, name, email, message, enquiryCategory })
    .returning({ id: messagesTable.id });

  const recipient = process.env.CONTACT_RECIPIENT_EMAIL;
  if (recipient) {
    sendContactEmail({ to: recipient, name, email, locale, enquiryCategory, message })
      .catch((err: unknown) => console.error("[contact] email error:", err));
  }

  res.json({ ok: true, id: saved.id });
});

// ── POST /api/script-requests ─────────────────────────────────────────────────

router.post("/script-requests", submissionLimiter, async (req: Request, res: Response): Promise<void> => {
  const body = req.body ?? {};

  // Honeypot
  if (body.website) {
    res.json({ ok: true });
    return;
  }

  const locale = String(body.locale ?? "");
  if (!VALID_LOCALES.has(locale)) {
    res.status(400).json({ error: "Invalid locale." });
    return;
  }

  const playSlug    = String(body.playSlug   ?? "").trim().slice(0, 200);
  const name        = clean(body.name).slice(0, 200);
  const email       = String(body.email ?? "").toLowerCase().trim().slice(0, 300);
  const message     = clean(body.message).slice(0, 5000);
  const organization = clean(body.organization).slice(0, 200);
  const role        = clean(body.role).slice(0, 200) || null;
  const city        = clean(body.city).slice(0, 100) || null;
  const country     = clean(body.country).slice(0, 100);
  const intendedUse  = String(body.intendedUse ?? "").trim();

  const invalid: string[] = [];
  if (!playSlug)                                  invalid.push("playSlug");
  if (!name)                                      invalid.push("name");
  if (!isValidEmail(email))                       invalid.push("email");
  if (message.length < 10)                        invalid.push("message");
  if (!organization)                              invalid.push("organization");
  if (!country)                                   invalid.push("country");
  if (!INTENDED_USE_OPTIONS.has(intendedUse))     invalid.push("intendedUse");

  if (invalid.length) {
    res.status(400).json({ error: "Validation failed.", fields: invalid });
    return;
  }

  // Verify the play exists and has a published translation for this locale
  const rows = await db
    .select({ id: playsTable.id, title: playTranslationsTable.title })
    .from(playsTable)
    .innerJoin(
      playTranslationsTable,
      and(
        eq(playTranslationsTable.playId, playsTable.id),
        eq(playTranslationsTable.locale, locale),
        eq(playTranslationsTable.status, "published"),
      ),
    )
    .where(eq(playsTable.slug, playSlug))
    .limit(1);

  if (!rows.length) {
    res.status(404).json({ error: "Play not found or not available." });
    return;
  }

  const play = rows[0];

  const [saved] = await db
    .insert(messagesTable)
    .values({
      type: "script_request",
      status: "new",
      locale,
      name,
      email,
      message,
      playId: play.id,
      organization,
      role,
      city,
      country,
      intendedUse,
    })
    .returning({ id: messagesTable.id });

  const recipient = process.env.CONTACT_RECIPIENT_EMAIL;
  if (recipient) {
    sendScriptRequestEmail({
      to: recipient,
      playTitle: play.title,
      name,
      email,
      organization,
      role,
      city,
      country,
      intendedUse,
      locale,
      message,
    }).catch((err: unknown) => console.error("[script-request] email error:", err));
  }

  res.json({ ok: true, id: saved.id, playTitle: play.title });
});

export default router;
