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
import { isAdminUser } from "../lib/adminGuard";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

/**
 * Preview mode: only admins can see draft content via the public API.
 * Any authenticated non-admin user still gets the published-only view.
 */
function isPreviewMode(req: Request): boolean {
  if (req.query.preview !== "true") return false;
  if (!req.isAuthenticated()) return false;
  const userId = (req.user as { id: string } | undefined)?.id;
  return !!(userId && isAdminUser(userId));
}

// ─── Fairy Tales ──────────────────────────────────────────────────────────────

router.get("/public/fairy-tales", async (req: Request, res: Response): Promise<void> => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

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
      coverImageAlt: t.coverImageAlt,
      publishedAt: t.publishedAt,
    })),
  );
});

router.get("/public/fairy-tales/:slug", async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params.slug);
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

  const statuses = isPreviewMode(req) ? ["published", "draft"] : ["published"];

  const [tale] = await db.select().from(fairyTalesTable).where(eq(fairyTalesTable.slug, slug));
  if (!tale) { res.status(404).json({ available: false, reason: "Not found" }); return; }

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
  if (!translation) { res.status(404).json({ available: false, reason: "Not available in this language" }); return; }

  // availableLocales uses the same status filter so preview still sees only draft/published
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
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    locale,
    ageRecommendation: tale.ageRecommendation,
    estimatedReadingTime: tale.estimatedReadingTime,
    themes: tale.themes,
    coverImagePath: tale.coverImagePath,
    coverImageAlt: translation.coverImageAlt,
    publishedAt: translation.publishedAt,
    availableLocales: publishedTranslations.map((r) => r.locale),
  });
});

// ─── Plays ────────────────────────────────────────────────────────────────────

router.get("/public/plays", async (req: Request, res: Response): Promise<void> => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

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
      coverImageAlt: t.coverImageAlt,
      publishedAt: t.publishedAt,
    })),
  );
});

router.get("/public/plays/:slug", async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params.slug);
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

  const statuses = isPreviewMode(req) ? ["published", "draft"] : ["published"];

  const [play] = await db.select().from(playsTable).where(eq(playsTable.slug, slug));
  if (!play) { res.status(404).json({ available: false, reason: "Not found" }); return; }

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
  if (!translation) { res.status(404).json({ available: false, reason: "Not available in this language" }); return; }

  const synopsisToReturn = play.scriptAvailability === "public" ? translation.synopsis : null;

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
    excerpt: translation.excerpt,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
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
    coverImageAlt: translation.coverImageAlt,
    publishedAt: translation.publishedAt,
    availableLocales: publishedTranslations.map((r) => r.locale),
  });
});

// ─── About ────────────────────────────────────────────────────────────────────

router.get("/public/about/:locale", async (req: Request, res: Response): Promise<void> => {
  const locale = String(req.params.locale);
  if (!LOCALES.includes(locale)) { res.status(404).json({ available: false, reason: "Invalid locale" }); return; }

  const [row] = await db
    .select()
    .from(aboutTranslationsTable)
    .where(eq(aboutTranslationsTable.locale, locale));

  if (!row) { res.status(404).json({ available: false, reason: "Not available in this language" }); return; }

  res.json({
    available: true,
    locale: row.locale,
    body: row.body,
    authorPhotoPath: row.authorPhotoPath,
    authorPhotoAlt: row.authorPhotoAlt,
  });
});

export default router;
