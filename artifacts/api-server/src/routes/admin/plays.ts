import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, playsTable, playTranslationsTable } from "@workspace/db";
import { generateSlug } from "../../lib/slug";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

async function getPlayWithTranslations(id: number) {
  const [play] = await db.select().from(playsTable).where(eq(playsTable.id, id));
  if (!play) return null;

  const translations = await db
    .select()
    .from(playTranslationsTable)
    .where(eq(playTranslationsTable.playId, id));

  return { ...play, translations };
}

function buildTranslationStatusSummary(translations: { locale: string; status: string; publishedAt: Date | null }[]) {
  return LOCALES.map((locale) => {
    const t = translations.find((tr) => tr.locale === locale);
    return { locale, status: t ? t.status : "missing", publishedAt: t?.publishedAt ?? null };
  });
}

// List all plays
router.get("/admin/plays", async (_req: Request, res: Response): Promise<void> => {
  const plays = await db.select().from(playsTable);

  const result = await Promise.all(
    plays.map(async (play) => {
      const translations = await db
        .select()
        .from(playTranslationsTable)
        .where(eq(playTranslationsTable.playId, play.id));

      return { ...play, translations: buildTranslationStatusSummary(translations) };
    }),
  );

  res.json(result);
});

// Create a new play
router.post("/admin/plays", async (req: Request, res: Response): Promise<void> => {
  const {
    slug: rawSlug,
    genre,
    targetAudience,
    estimatedDuration,
    castSize,
    scriptAvailability,
    stagingComplexity,
    productionHistory,
    awards,
    coverImagePath,
  } = req.body as {
    slug?: string;
    genre?: string | null;
    targetAudience?: string | null;
    estimatedDuration?: number | null;
    castSize?: string | null;
    scriptAvailability?: string;
    stagingComplexity?: string | null;
    productionHistory?: string | null;
    awards?: string | null;
    coverImagePath?: string | null;
  };

  const slug = rawSlug?.trim() ? rawSlug.trim() : generateSlug(String(Date.now()));

  const [play] = await db
    .insert(playsTable)
    .values({
      slug,
      genre,
      targetAudience,
      estimatedDuration,
      castSize,
      scriptAvailability: scriptAvailability ?? "on_request",
      stagingComplexity,
      productionHistory,
      awards,
      coverImagePath,
    })
    .returning();

  const detail = await getPlayWithTranslations(play.id);
  res.status(201).json(detail);
});

// Get a play with all translations
router.get("/admin/plays/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const detail = await getPlayWithTranslations(id);
  if (!detail) { res.status(404).json({ error: "Not found" }); return; }

  res.json(detail);
});

// Update play base metadata
router.patch("/admin/plays/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const fields = [
    "slug", "genre", "targetAudience", "estimatedDuration", "castSize",
    "scriptAvailability", "stagingComplexity", "productionHistory", "awards", "coverImagePath",
  ] as const;
  for (const field of fields) {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  }

  const [updated] = await db
    .update(playsTable)
    .set(updateData)
    .where(eq(playsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  const detail = await getPlayWithTranslations(id);
  res.json(detail);
});

// Delete a play
router.delete("/admin/plays/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(playsTable).where(eq(playsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }

  res.sendStatus(204);
});

// Upsert a play translation
router.put(
  "/admin/plays/:id/translations/:locale",
  async (req: Request, res: Response): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;

    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const { title, logline, synopsis, excerpt, stagingNotes, productionInfo, seoTitle, seoDescription } =
      req.body as {
        title?: string;
        logline?: string | null;
        synopsis?: string | null;
        excerpt?: string | null;
        stagingNotes?: string | null;
        productionInfo?: string | null;
        seoTitle?: string | null;
        seoDescription?: string | null;
      };

    if (!title?.trim()) { res.status(400).json({ error: "title is required" }); return; }

    await db
      .insert(playTranslationsTable)
      .values({ playId: id, locale, title, logline, synopsis, excerpt, stagingNotes, productionInfo, seoTitle, seoDescription })
      .onConflictDoUpdate({
        target: [playTranslationsTable.playId, playTranslationsTable.locale],
        set: { title, logline, synopsis, excerpt, stagingNotes, productionInfo, seoTitle, seoDescription, updatedAt: new Date() },
      });

    const detail = await getPlayWithTranslations(id);
    if (!detail) { res.status(404).json({ error: "Not found" }); return; }

    res.json(detail);
  },
);

// Publish a play translation
router.post(
  "/admin/plays/:id/translations/:locale/publish",
  async (req: Request, res: Response): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;

    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const [updated] = await db
      .update(playTranslationsTable)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(playTranslationsTable.playId, id), eq(playTranslationsTable.locale, locale)))
      .returning();

    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }

    const detail = await getPlayWithTranslations(id);
    res.json(detail);
  },
);

// Unpublish a play translation
router.post(
  "/admin/plays/:id/translations/:locale/unpublish",
  async (req: Request, res: Response): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;

    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const [updated] = await db
      .update(playTranslationsTable)
      .set({ status: "draft", updatedAt: new Date() })
      .where(and(eq(playTranslationsTable.playId, id), eq(playTranslationsTable.locale, locale)))
      .returning();

    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }

    const detail = await getPlayWithTranslations(id);
    res.json(detail);
  },
);

export default router;
