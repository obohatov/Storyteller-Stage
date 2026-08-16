import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, fairyTalesTable, fairyTaleTranslationsTable } from "@workspace/db";
import { generateSlug } from "../../lib/slug";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

async function getFairyTaleWithTranslations(id: number) {
  const [tale] = await db
    .select()
    .from(fairyTalesTable)
    .where(eq(fairyTalesTable.id, id));
  if (!tale) return null;

  const translations = await db
    .select()
    .from(fairyTaleTranslationsTable)
    .where(eq(fairyTaleTranslationsTable.fairyTaleId, id));

  return { ...tale, translations };
}

function buildTranslationStatusSummary(translations: { locale: string; status: string; publishedAt: Date | null }[]) {
  return LOCALES.map((locale) => {
    const t = translations.find((tr) => tr.locale === locale);
    return {
      locale,
      status: t ? t.status : "missing",
      publishedAt: t?.publishedAt ?? null,
    };
  });
}

// List all fairy tales with translation status
router.get("/admin/fairy-tales", async (_req: Request, res: Response): Promise<void> => {
  const tales = await db.select().from(fairyTalesTable);

  const result = await Promise.all(
    tales.map(async (tale) => {
      const translations = await db
        .select()
        .from(fairyTaleTranslationsTable)
        .where(eq(fairyTaleTranslationsTable.fairyTaleId, tale.id));

      return {
        ...tale,
        translations: buildTranslationStatusSummary(translations),
      };
    }),
  );

  res.json(result);
});

// Create a new fairy tale
router.post("/admin/fairy-tales", async (req: Request, res: Response): Promise<void> => {
  const { slug: rawSlug, ageRecommendation, estimatedReadingTime, themes, coverImagePath } =
    req.body as {
      slug?: string;
      ageRecommendation?: string | null;
      estimatedReadingTime?: number | null;
      themes?: string[] | null;
      coverImagePath?: string | null;
    };

  const slug = rawSlug?.trim() ? rawSlug.trim() : generateSlug(String(Date.now()));
  if (!slug) {
    res.status(400).json({ error: "slug is required" });
    return;
  }

  const [tale] = await db
    .insert(fairyTalesTable)
    .values({ slug, ageRecommendation, estimatedReadingTime, themes, coverImagePath })
    .returning();

  const detail = await getFairyTaleWithTranslations(tale.id);
  res.status(201).json(detail);
});

// Get a single fairy tale with all translations
router.get("/admin/fairy-tales/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const detail = await getFairyTaleWithTranslations(id);
  if (!detail) { res.status(404).json({ error: "Not found" }); return; }

  res.json(detail);
});

// Update fairy tale base metadata
router.patch("/admin/fairy-tales/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { slug, ageRecommendation, estimatedReadingTime, themes, coverImagePath } = req.body as {
    slug?: string;
    ageRecommendation?: string | null;
    estimatedReadingTime?: number | null;
    themes?: string[] | null;
    coverImagePath?: string | null;
  };

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (slug != null) updateData.slug = slug;
  if (ageRecommendation !== undefined) updateData.ageRecommendation = ageRecommendation;
  if (estimatedReadingTime !== undefined) updateData.estimatedReadingTime = estimatedReadingTime;
  if (themes !== undefined) updateData.themes = themes;
  if (coverImagePath !== undefined) updateData.coverImagePath = coverImagePath;

  const [updated] = await db
    .update(fairyTalesTable)
    .set(updateData)
    .where(eq(fairyTalesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  const detail = await getFairyTaleWithTranslations(id);
  res.json(detail);
});

// Delete fairy tale (cascade deletes translations)
router.delete("/admin/fairy-tales/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db
    .delete(fairyTalesTable)
    .where(eq(fairyTalesTable.id, id))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }

  res.sendStatus(204);
});

// Upsert a translation for a fairy tale
router.put(
  "/admin/fairy-tales/:id/translations/:locale",
  async (req: Request, res: Response): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;

    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const { title, blurb, body, seoTitle, seoDescription } = req.body as {
      title?: string;
      blurb?: string | null;
      body?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
    };

    if (!title?.trim()) { res.status(400).json({ error: "title is required" }); return; }

    await db
      .insert(fairyTaleTranslationsTable)
      .values({ fairyTaleId: id, locale, title, blurb, body, seoTitle, seoDescription })
      .onConflictDoUpdate({
        target: [fairyTaleTranslationsTable.fairyTaleId, fairyTaleTranslationsTable.locale],
        set: { title, blurb, body, seoTitle, seoDescription, updatedAt: new Date() },
      });

    const detail = await getFairyTaleWithTranslations(id);
    if (!detail) { res.status(404).json({ error: "Not found" }); return; }

    res.json(detail);
  },
);

// Publish a translation
router.post(
  "/admin/fairy-tales/:id/translations/:locale/publish",
  async (req: Request, res: Response): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;

    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const [updated] = await db
      .update(fairyTaleTranslationsTable)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(fairyTaleTranslationsTable.fairyTaleId, id),
          eq(fairyTaleTranslationsTable.locale, locale),
        ),
      )
      .returning();

    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }

    const detail = await getFairyTaleWithTranslations(id);
    res.json(detail);
  },
);

// Unpublish a translation
router.post(
  "/admin/fairy-tales/:id/translations/:locale/unpublish",
  async (req: Request, res: Response): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;

    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const [updated] = await db
      .update(fairyTaleTranslationsTable)
      .set({ status: "draft", updatedAt: new Date() })
      .where(
        and(
          eq(fairyTaleTranslationsTable.fairyTaleId, id),
          eq(fairyTaleTranslationsTable.locale, locale),
        ),
      )
      .returning();

    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }

    const detail = await getFairyTaleWithTranslations(id);
    res.json(detail);
  },
);

export default router;
