import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, fairyTalesTable, fairyTaleTranslationsTable } from "@workspace/db";
import { generateSlug } from "../../lib/slug";
import { sanitizeRichText } from "../../lib/sanitize";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

function normalizeSlug(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const slug = generateSlug(raw.trim());
  return slug && SLUG_PATTERN.test(slug) ? slug : null;
}

function clampString(
  val: unknown,
  name: string,
  maxLen: number,
  required = false,
): string | null | undefined {
  if (val === undefined) {
    if (required) throw { field: name, message: "is required" };
    return undefined;
  }
  if (val === null) return null;
  if (typeof val !== "string") throw { field: name, message: "must be a string" };
  if (val.length > maxLen) throw { field: name, message: `must be at most ${maxLen} characters` };
  return val;
}

function clampInt(
  val: unknown,
  name: string,
  min: number,
  max: number,
): number | null | undefined {
  if (val === undefined || val === null) return val as null | undefined;
  const n = Number(val);
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw { field: name, message: "must be an integer" };
  if (n < min || n > max) throw { field: name, message: `must be between ${min} and ${max}` };
  return n;
}

async function getFairyTaleWithTranslations(id: number) {
  const [tale] = await db.select().from(fairyTalesTable).where(eq(fairyTalesTable.id, id));
  if (!tale) return null;
  const translations = await db
    .select()
    .from(fairyTaleTranslationsTable)
    .where(eq(fairyTaleTranslationsTable.fairyTaleId, id));
  return { ...tale, translations };
}

function buildStatusSummary(translations: { locale: string; status: string; publishedAt: Date | null }[]) {
  return LOCALES.map((locale) => {
    const t = translations.find((tr) => tr.locale === locale);
    return { locale, status: t ? t.status : "missing", publishedAt: t?.publishedAt ?? null };
  });
}

// ─── List ─────────────────────────────────────────────────────────────────────

router.get("/admin/fairy-tales", async (_req: Request, res: Response): Promise<void> => {
  const tales = await db.select().from(fairyTalesTable);
  const result = await Promise.all(
    tales.map(async (tale) => {
      const translations = await db
        .select()
        .from(fairyTaleTranslationsTable)
        .where(eq(fairyTaleTranslationsTable.fairyTaleId, tale.id));
      return { ...tale, translations: buildStatusSummary(translations) };
    }),
  );
  res.json(result);
});

// ─── Create ───────────────────────────────────────────────────────────────────

router.post("/admin/fairy-tales", async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const rawSlug = typeof body.slug === "string" ? body.slug : "";
    const slug = rawSlug.trim()
      ? normalizeSlug(rawSlug)
      : normalizeSlug(String(Date.now()));

    if (!slug) {
      res.status(400).json({ error: "slug", message: "invalid or empty slug" });
      return;
    }

    const ageRecommendation = clampString(body.ageRecommendation, "ageRecommendation", 50);
    const estimatedReadingTime = clampInt(body.estimatedReadingTime, "estimatedReadingTime", 1, 9999);
    const coverImagePath = clampString(body.coverImagePath, "coverImagePath", 500);

    // themes: array of strings
    let themes: string[] | null | undefined = undefined;
    if (body.themes !== undefined) {
      if (body.themes === null) {
        themes = null;
      } else if (!Array.isArray(body.themes)) {
        res.status(400).json({ error: "themes", message: "must be an array" });
        return;
      } else {
        if (body.themes.length > 20) { res.status(400).json({ error: "themes", message: "at most 20 themes" }); return; }
        themes = (body.themes as unknown[]).map((t, i) => {
          if (typeof t !== "string") throw { field: `themes[${i}]`, message: "must be a string" };
          if (t.length > 50) throw { field: `themes[${i}]`, message: "max 50 characters" };
          return t;
        });
      }
    }

    const [tale] = await db
      .insert(fairyTalesTable)
      .values({ slug, ageRecommendation, estimatedReadingTime, themes, coverImagePath })
      .returning();

    res.status(201).json(await getFairyTaleWithTranslations(tale.id));
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      res.status(409).json({ error: "slug", message: "a fairy tale with this slug already exists" });
    } else if (err && typeof err === "object" && "field" in err) {
      res.status(400).json(err);
    } else { throw err; }
  }
});

// ─── Get one ──────────────────────────────────────────────────────────────────

router.get("/admin/fairy-tales/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const detail = await getFairyTaleWithTranslations(id);
  if (!detail) { res.status(404).json({ error: "Not found" }); return; }
  res.json(detail);
});

// ─── Update base metadata ─────────────────────────────────────────────────────

router.patch("/admin/fairy-tales/:id", async (req: Request, res: Response): Promise<void> => {
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
    if (body.ageRecommendation !== undefined)
      updateData.ageRecommendation = clampString(body.ageRecommendation, "ageRecommendation", 50);
    if (body.estimatedReadingTime !== undefined)
      updateData.estimatedReadingTime = clampInt(body.estimatedReadingTime, "estimatedReadingTime", 1, 9999);
    if (body.coverImagePath !== undefined)
      updateData.coverImagePath = clampString(body.coverImagePath, "coverImagePath", 500);
    if (body.themes !== undefined) {
      if (body.themes === null) {
        updateData.themes = null;
      } else if (Array.isArray(body.themes)) {
        updateData.themes = body.themes.slice(0, 20).map(String);
      }
    }

    const [updated] = await db.update(fairyTalesTable).set(updateData).where(eq(fairyTalesTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await getFairyTaleWithTranslations(id));
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      res.status(409).json({ error: "slug", message: "a fairy tale with this slug already exists" });
    } else if (err && typeof err === "object" && "field" in err) {
      res.status(400).json(err);
    } else { throw err; }
  }
});

// ─── Delete ───────────────────────────────────────────────────────────────────

router.delete("/admin/fairy-tales/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  // ON DELETE CASCADE removes translations automatically
  const [deleted] = await db.delete(fairyTalesTable).where(eq(fairyTalesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

// ─── Upsert translation ───────────────────────────────────────────────────────

router.put(
  "/admin/fairy-tales/:id/translations/:locale",
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    const locale = String(req.params.locale);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    try {
      const body = req.body as Record<string, unknown>;
      const title = clampString(body.title, "title", 300, true) as string;
      if (!title.trim()) { res.status(400).json({ error: "title", message: "is required" }); return; }
      const blurb = clampString(body.blurb, "blurb", 1000);
      const rawBody = clampString(body.body, "body", 200_000);
      const sanitizedBody = typeof rawBody === "string" ? sanitizeRichText(rawBody) : rawBody;
      const seoTitle = clampString(body.seoTitle, "seoTitle", 120);
      const seoDescription = clampString(body.seoDescription, "seoDescription", 320);

      await db
        .insert(fairyTaleTranslationsTable)
        .values({ fairyTaleId: id, locale, title, blurb, body: sanitizedBody, seoTitle, seoDescription })
        .onConflictDoUpdate({
          target: [fairyTaleTranslationsTable.fairyTaleId, fairyTaleTranslationsTable.locale],
          set: { title, blurb, body: sanitizedBody, seoTitle, seoDescription, updatedAt: new Date() },
        });

      const detail = await getFairyTaleWithTranslations(id);
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
  "/admin/fairy-tales/:id/translations/:locale/publish",
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    const locale = String(req.params.locale);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const [updated] = await db
      .update(fairyTaleTranslationsTable)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(fairyTaleTranslationsTable.fairyTaleId, id), eq(fairyTaleTranslationsTable.locale, locale)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }
    res.json(await getFairyTaleWithTranslations(id));
  },
);

router.post(
  "/admin/fairy-tales/:id/translations/:locale/unpublish",
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    const locale = String(req.params.locale);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    if (!LOCALES.includes(locale)) { res.status(400).json({ error: "Invalid locale" }); return; }

    const [updated] = await db
      .update(fairyTaleTranslationsTable)
      .set({ status: "draft", updatedAt: new Date() })
      .where(and(eq(fairyTaleTranslationsTable.fairyTaleId, id), eq(fairyTaleTranslationsTable.locale, locale)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Translation not found" }); return; }
    res.json(await getFairyTaleWithTranslations(id));
  },
);

export default router;
