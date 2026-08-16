import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, aboutTranslationsTable } from "@workspace/db";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

// Get about for a locale
router.get("/admin/about/:locale", async (req: Request, res: Response): Promise<void> => {
  const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

  const [row] = await db
    .select()
    .from(aboutTranslationsTable)
    .where(eq(aboutTranslationsTable.locale, locale));

  // Return empty record if not yet created
  res.json({
    locale,
    body: row?.body ?? null,
    authorPhotoPath: row?.authorPhotoPath ?? null,
    updatedAt: row?.updatedAt ?? new Date(),
  });
});

// Create or update about for a locale
router.put("/admin/about/:locale", async (req: Request, res: Response): Promise<void> => {
  const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

  const { body, authorPhotoPath } = req.body as {
    body?: string | null;
    authorPhotoPath?: string | null;
  };

  const [row] = await db
    .insert(aboutTranslationsTable)
    .values({ locale, body, authorPhotoPath })
    .onConflictDoUpdate({
      target: [aboutTranslationsTable.locale],
      set: { body, authorPhotoPath, updatedAt: new Date() },
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
