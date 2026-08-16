import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, aboutTranslationsTable } from "@workspace/db";
import { sanitizeRichText } from "../../lib/sanitize";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

router.get("/admin/about/:locale", async (req: Request, res: Response): Promise<void> => {
  const locale = String(req.params.locale);
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

  const [row] = await db
    .select()
    .from(aboutTranslationsTable)
    .where(eq(aboutTranslationsTable.locale, locale));

  res.json({
    locale,
    body: row?.body ?? null,
    authorPhotoPath: row?.authorPhotoPath ?? null,
    updatedAt: row?.updatedAt ?? new Date(),
  });
});

router.put("/admin/about/:locale", async (req: Request, res: Response): Promise<void> => {
  const locale = String(req.params.locale);
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

  const body = req.body as Record<string, unknown>;

  // Validate and sanitize
  let richBody: string | null = null;
  if (body.body !== undefined && body.body !== null) {
    if (typeof body.body !== "string") { res.status(400).json({ error: "body", message: "must be a string" }); return; }
    if (body.body.length > 200_000) { res.status(400).json({ error: "body", message: "must be at most 200,000 characters" }); return; }
    richBody = sanitizeRichText(body.body);
  }

  let authorPhotoPath: string | null = null;
  if (body.authorPhotoPath !== undefined && body.authorPhotoPath !== null) {
    if (typeof body.authorPhotoPath !== "string") { res.status(400).json({ error: "authorPhotoPath", message: "must be a string" }); return; }
    if (body.authorPhotoPath.length > 500) { res.status(400).json({ error: "authorPhotoPath", message: "must be at most 500 characters" }); return; }
    authorPhotoPath = body.authorPhotoPath;
  }

  const [row] = await db
    .insert(aboutTranslationsTable)
    .values({ locale, body: richBody, authorPhotoPath })
    .onConflictDoUpdate({
      target: [aboutTranslationsTable.locale],
      set: { body: richBody, authorPhotoPath, updatedAt: new Date() },
    })
    .returning();

  res.json({
    locale: row.locale,
    body: row.body,
    authorPhotoPath: row.authorPhotoPath,
    updatedAt: row.updatedAt,
  });
});

export default router;
