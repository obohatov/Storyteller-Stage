import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, inArray } from "drizzle-orm";
import {
  db,
  fairyTalesTable,
  fairyTaleTranslationsTable,
  playsTable,
  playTranslationsTable,
  aboutTranslationsTable,
} from "@workspace/db";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

function isPreviewMode(req: Request): boolean {
  return req.isAuthenticated() && req.query.preview === "true";
}

// ─── Fairy Tales ──────────────────────────────────────────────────────────────

router.get("/public/fairy-tales", async (req: Request, res: Response): Promise<void> => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) {
    res.status(400).json({ error: "Invalid locale" });
    return;
  }

  const statuses = isPreviewMode(req) ? ["published", "draft"] : ["published"];

  const rows = await db
    .select()
    .from(fairyTalesTable)
    .innerJoin(
      fairyTaleTranslationsTable,
      and(
        eq(fairyTaleTranslationsTable.fairyTaleId, fairyTalesTable.id),
        eq(fairyTaleTranslationsTable.locale, locale),
        inArray(fairyTaleTranslationsTable.status, statuses),
      ),
    );

  res.json(
    rows.map(({ fairy_tales, fairy_tale_translations: t }) => ({
      slug: fairy_tales.slug,
      title: t.title,
      blurb: t.blurb,
      locale,
      ageRecommendation: fairy_tales.ageRecommendation,
      estimatedReadingTime: fairy_tales.estimatedReadingTime,
      themes: fairy_tales.themes,
      coverImagePath: fairy_tales.coverImagePath,
      publishedAt: t.publishedAt,
    })),
  );
});

router.get("/public/fairy-tales/:slug", async (req: Request, res: Response): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) {
    res.status(400).json({ error: "Invalid locale" });
    return;
  }

  const statuses = isPreviewMode(req) ? ["published", "draft"] : ["published"];

  const [tale] = await db.select().from(fairyTalesTable).where(eq(fairyTalesTable.slug, slug));
  if (!tale) {
    res.status(404).json({ available: false, reason: "Not found" });
    return;
  }

  // Get the requested locale translation
  const [translation] = await db
    .select()
    .from(fairyTaleTranslationsTable)
    .where(
      and(
        eq(fairyTaleTranslationsTable.fairyTaleId, tale.id),
        eq(fairyTaleTranslationsTable.locale, locale),
        inArray(fairyTaleTranslationsTable.status, statuses),
      ),
    );

  if (!translation) {
    res.status(404).json({ available: false, reason: "Not available in this language" });
    return;
  }

  // Get list of published locales for language-switch awareness
  const publishedTranslations = await db
    .select({ locale: fairyTaleTranslationsTable.locale })
    .from(fairyTaleTranslationsTable)
    .where(
      and(
        eq(fairyTaleTranslationsTable.fairyTaleId, tale.id),
        inArray(fairyTaleTranslationsTable.status, statuses),
      ),
    );

  res.json({
    available: true,
    slug: tale.slug,
    title: translation.title,
    blurb: translation.blurb,
    body: translation.body,
    locale,
    ageRecommendation: tale.ageRecommendation,
    estimatedReadingTime: tale.estimatedReadingTime,
    themes: tale.themes,
    coverImagePath: tale.coverImagePath,
    publishedAt: translation.publishedAt,
    availableLocales: publishedTranslations.map((r) => r.locale),
  });
});

// ─── Plays ────────────────────────────────────────────────────────────────────

router.get("/public/plays", async (req: Request, res: Response): Promise<void> => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) {
    res.status(400).json({ error: "Invalid locale" });
    return;
  }

  const statuses = isPreviewMode(req) ? ["published", "draft"] : ["published"];

  const rows = await db
    .select()
    .from(playsTable)
    .innerJoin(
      playTranslationsTable,
      and(
        eq(playTranslationsTable.playId, playsTable.id),
        eq(playTranslationsTable.locale, locale),
        inArray(playTranslationsTable.status, statuses),
      ),
    );

  res.json(
    rows.map(({ plays, play_translations: t }) => ({
      slug: plays.slug,
      title: t.title,
      logline: t.logline,
      locale,
      genre: plays.genre,
      targetAudience: plays.targetAudience,
      estimatedDuration: plays.estimatedDuration,
      castSize: plays.castSize,
      coverImagePath: plays.coverImagePath,
      publishedAt: t.publishedAt,
    })),
  );
});

router.get("/public/plays/:slug", async (req: Request, res: Response): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) {
    res.status(400).json({ error: "Invalid locale" });
    return;
  }

  const statuses = isPreviewMode(req) ? ["published", "draft"] : ["published"];

  const [play] = await db.select().from(playsTable).where(eq(playsTable.slug, slug));
  if (!play) {
    res.status(404).json({ available: false, reason: "Not found" });
    return;
  }

  const [translation] = await db
    .select()
    .from(playTranslationsTable)
    .where(
      and(
        eq(playTranslationsTable.playId, play.id),
        eq(playTranslationsTable.locale, locale),
        inArray(playTranslationsTable.status, statuses),
      ),
    );

  if (!translation) {
    res.status(404).json({ available: false, reason: "Not available in this language" });
    return;
  }

  // Hide full body when script_availability is not 'public'
  const synopsisToReturn =
    play.scriptAvailability === "public" ? translation.synopsis : null;
  const excerptToReturn = translation.excerpt;

  const publishedTranslations = await db
    .select({ locale: playTranslationsTable.locale })
    .from(playTranslationsTable)
    .where(
      and(
        eq(playTranslationsTable.playId, play.id),
        inArray(playTranslationsTable.status, statuses),
      ),
    );

  res.json({
    available: true,
    slug: play.slug,
    title: translation.title,
    logline: translation.logline,
    synopsis: synopsisToReturn,
    excerpt: excerptToReturn,
    locale,
    genre: play.genre,
    targetAudience: play.targetAudience,
    estimatedDuration: play.estimatedDuration,
    castSize: play.castSize,
    scriptAvailability: play.scriptAvailability,
    stagingComplexity: play.stagingComplexity,
    productionHistory: play.productionHistory,
    awards: play.awards,
    stagingNotes: translation.stagingNotes,
    productionInfo: translation.productionInfo,
    coverImagePath: play.coverImagePath,
    publishedAt: translation.publishedAt,
    availableLocales: publishedTranslations.map((r) => r.locale),
  });
});

// ─── About ────────────────────────────────────────────────────────────────────

router.get("/public/about/:locale", async (req: Request, res: Response): Promise<void> => {
  const locale = Array.isArray(req.params.locale) ? req.params.locale[0] : req.params.locale;
  if (!LOCALES.includes(locale)) {
    res.status(404).json({ available: false, reason: "Invalid locale" });
    return;
  }

  const [row] = await db
    .select()
    .from(aboutTranslationsTable)
    .where(eq(aboutTranslationsTable.locale, locale));

  if (!row) {
    res.status(404).json({ available: false, reason: "Not available in this language" });
    return;
  }

  res.json({
    available: true,
    locale: row.locale,
    body: row.body,
    authorPhotoPath: row.authorPhotoPath,
  });
});

export default router;
