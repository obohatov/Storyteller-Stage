import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, playsTable, playTranslationsTable } from "@workspace/db";
import { generateSlug } from "../../lib/slug";
import { sanitizeRichText } from "../../lib/sanitize";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
const SCRIPT_AVAILABILITY = ["public", "excerpt_only", "on_request"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505";
}

function normalizeSlug(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const slug = generateSlug(raw.trim());
  return slug && SLUG_PATTERN.test(slug) ? slug : null;
}

function clampString(val: unknown, name: string, maxLen: number, required = false): string | null | undefined {
  if (val === undefined) { if (required) throw { field: name, message: "is required" }; return undefined; }
  if (val === null) return null;
  if (typeof val !== "string") throw { field: name, message: "must be a string" };
  if (val.length > maxLen) throw { field: name, message: `must be at most ${maxLen} characters` };
  return val;
}

function clampInt(val: unknown, name: string, min: number, max: number): number | null | undefined {
  if (val === undefined || val === null) return val as null | undefined;
  const n = Number(val);
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw { field: name, message: "must be an integer" };
  if (n < min || n > max) throw { field: name, message: `must be between ${min} and ${max}` };
  return n;
}

async function getPlayWithTranslations(id: number) {
  const [play] = await db.select().from(playsTable).where(eq(playsTable.id, id));
  if (!play) return null;
  const translations = await db.select().from(playTranslationsTable).where(eq(playTranslationsTable.playId, id));
  return { ...play, translations };
}

function buildStatusSummary(translations: { locale: string; status: string; publishedAt: Date | null }[]) {
  return LOCALES.map((locale) => {
    const t = translations.find((tr) => tr.locale === locale);
    return { locale, status: t ? t.status : "missing", publishedAt: t?.publishedAt ?? null };
  });
}

// ─── List ─────────────────────────────────────────────────────────────────────

router.get("/admin/plays", async (_req: Request, res: Response): Promise<void> => {
  const plays = await db.select().from(playsTable);
  const result = await Promise.all(
    plays.map(async (play) => {
      const translations = await db.select().from(playTranslationsTable).where(eq(playTranslationsTable.playId, play.id));
      return { ...play, translations: buildStatusSummary(translations) };
    }),
  );
  res.json(result);
});

// ─── Create ───────────────────────────────────────────────────────────────────

router.post("/admin/plays", async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const rawSlug = typeof body.slug === "string" ? body.slug : "";
    const slug = rawSlug.trim() ? normalizeSlug(rawSlug) : normalizeSlug(String(Date.now()));
    if (!slug) { res.status(400).json({ error: "slug", message: "invalid or empty slug" }); return; }

    const genre = clampString(body.genre, "genre", 100);
    const targetAudience = clampString(body.targetAudience, "targetAudience", 200);
    const estimatedDuration = clampInt(body.estimatedDuration, "estimatedDuration", 1, 9999);
    const castSize = clampString(body.castSize, "castSize", 100);
    const coverImagePath = clampString(body.coverImagePath, "coverImagePath", 500);
    const stagingComplexity = clampString(body.stagingComplexity, "stagingComplexity", 200);
    const rawProductionHistory = clampString(body.productionHistory, "productionHistory", 5000);
    const productionHistory = typeof rawProductionHistory === "string" ? sanitizeRichText(rawProductionHistory) : rawProductionHistory;
    const rawAwards = clampString(body.awards, "awards", 5000);
    const awards = typeof rawAwards === "string" ? sanitizeRichText(rawAwards) : rawAwards;

    const rawAvailability = typeof body.scriptAvailability === "string" ? body.scriptAvailability : "on_request";
    const scriptAvailability = SCRIPT_AVAILABILITY.includes(rawAvailability as typeof SCRIPT_AVAILABILITY[number])
      ? (rawAvailability as typeof SCRIPT_AVAILABILITY[number])
      : "on_request";

    const [play] = await db
      .insert(playsTable)
      .values({ slug, genre, targetAudience, estimatedDuration, castSize, scriptAvailability, stagingComplexity, productionHistory, awards, coverImagePath })
      .returning();

    res.status(201).json(await getPlayWithTranslations(play.id));
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      res.status(409).json({ error: "slug", message: "a play with this slug already exists" });
    } else if (err && typeof err === "object" && "field" in err) {
      res.status(400).json(err);
    } else { throw err; }
  }
});

// ─── Get one ──────────────────────────────────────────────────────────────────

router.get("/admin/plays/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const detail = await getPlayWithTranslations(id);
  if (!detail) { res.status(404).json({ error: "Not found" }); return; }
  res.json(detail);
});

// ─── Update base metadata ─────────────────────────────────────────────────────

router.patch("/admin/plays/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const body = req.body as Record<string, unknown>;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (body.slug !== undefined) {
      const slug = normalizeSlug(String(body.slug));
      if (!slug) { res.status(400).json({ error: "slug", message: "invalid slug format" }); return; }
      updateData.slug = slug;
    }
    if (body.genre !== undefined) updateData.genre = clampString(body.genre, "genre", 100);
    if (body.targetAudience !== undefined) updateData.targetAudience = clampString(body.targetAudience, "targetAudience", 200);
    if (body.estimatedDuration !== undefined) updateData.estimatedDuration = clampInt(body.estimatedDuration, "estimatedDuration", 1, 9999);
    if (body.castSize !== undefined) updateData.castSize = clampString(body.castSize, "castSize", 100);
    if (body.coverImagePath !== undefined) updateData.coverImagePath = clampString(body.coverImagePath, "coverImagePath", 500);
    if (body.stagingComplexity !== undefined) updateData.stagingComplexity = clampString(body.stagingComplexity, "stagingComplexity", 200);
    if (body.productionHistory !== undefined) {
      const raw = clampString(body.productionHistory, "productionHistory", 5000);
      updateData.productionHistory = typeof raw === "string" ? sanitizeRichText(raw) : raw;
    }
    if (body.awards !== undefined) {
      const raw = clampString(body.awards, "awards", 5000);
      updateData.awards = typeof raw === "string" ? sanitizeRichText(raw) : raw;
    }
    if (typeof body.scriptAvailability === "string" && SCRIPT_AVAILABILITY.includes(body.scriptAvailability as typeof SCRIPT_AVAILABILITY[number])) {
      updateData.scriptAvailability = body.scriptAvailability;
    }

    const [updated] = await db.update(playsTable).set(updateData).where(eq(playsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await getPlayWithTranslations(id));
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      res.status(409).json({ error: "slug", message: "a play with this slug already exists" });
    } else if (err && typeof err === "object" && "field" in err) {
      res.status(400).json(err);
    } else { throw err; }
  }
});

// ─── Delete ───────────────────────────────────────────────────────────────────

router.delete("/admin/plays/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [deleted] = await db.delete(playsTable).where(eq(playsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

// ─── Upsert translation ───────────────────────────────────────────────────────

router.put(
  "/admin/plays/:id/translations/:locale",
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    const locale = String(req.params.locale);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    try {
      const body = req.body as Record<string, unknown>;
      const title = clampString(body.title, "title", 300, true) as string;
      if (!title.trim()) { res.status(400).json({ error: "title", message: "is required" }); return; }
      const logline = clampString(body.logline, "logline", 1000);
      const rawSynopsis = clampString(body.synopsis, "synopsis", 200_000);
      const synopsis = typeof rawSynopsis === "string" ? sanitizeRichText(rawSynopsis) : rawSynopsis;
      const rawExcerpt = clampString(body.excerpt, "excerpt", 200_000);
      const excerpt = typeof rawExcerpt === "string" ? sanitizeRichText(rawExcerpt) : rawExcerpt;
      const rawStagingNotes = clampString(body.stagingNotes, "stagingNotes", 50_000);
      const stagingNotes = typeof rawStagingNotes === "string" ? sanitizeRichText(rawStagingNotes) : rawStagingNotes;
      const rawProductionInfo = clampString(body.productionInfo, "productionInfo", 10_000);
      const productionInfo = typeof rawProductionInfo === "string" ? sanitizeRichText(rawProductionInfo) : rawProductionInfo;
      const seoTitle = clampString(body.seoTitle, "seoTitle", 120);
      const seoDescription = clampString(body.seoDescription, "seoDescription", 320);
      const coverImageAlt = clampString(body.coverImageAlt, "coverImageAlt", 300);

      await db
        .insert(playTranslationsTable)
        .values({ playId: id, locale, title, logline, synopsis, excerpt, stagingNotes, productionInfo, seoTitle, seoDescription, coverImageAlt })
        .onConflictDoUpdate({
          target: [playTranslationsTable.playId, playTranslationsTable.locale],
          set: { title, logline, synopsis, excerpt, stagingNotes, productionInfo, seoTitle, seoDescription, coverImageAlt, updatedAt: new Date() },
        });

      const detail = await getPlayWithTranslations(id);
      if (!detail) { res.status(404).json({ error: "Not found" }); return; }
      res.json(detail);
    } catch (err) {
      if (err && typeof err === "object" && "field" in err) {
        res.status(400).json(err);
      } else { throw err; }
    }
  },
);

// ─── Publish / Unpublish ──────────────────────────────────────────────────────

router.post(
  "/admin/plays/:id/translations/:locale/publish",
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    const locale = String(req.params.locale);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }
    const [updated] = await db
      .update(playTranslationsTable)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(playTranslationsTable.playId, id), eq(playTranslationsTable.locale, locale)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }
    res.json(await getPlayWithTranslations(id));
  },
);

router.post(
  "/admin/plays/:id/translations/:locale/unpublish",
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    const locale = String(req.params.locale);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }
    const [updated] = await db
      .update(playTranslationsTable)
      .set({ status: "draft", updatedAt: new Date() })
      .where(and(eq(playTranslationsTable.playId, id), eq(playTranslationsTable.locale, locale)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }
    res.json(await getPlayWithTranslations(id));
  },
);

export default router;
