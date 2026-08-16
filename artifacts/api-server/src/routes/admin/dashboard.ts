import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, fairyTaleTranslationsTable, playTranslationsTable } from "@workspace/db";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

router.get("/admin/dashboard", async (_req: Request, res: Response): Promise<void> => {
  const [ftPublished, ftDraft, plPublished, plDraft] = await Promise.all([
    db
      .select({ value: count() })
      .from(fairyTaleTranslationsTable)
      .where(eq(fairyTaleTranslationsTable.status, "published")),
    db
      .select({ value: count() })
      .from(fairyTaleTranslationsTable)
      .where(eq(fairyTaleTranslationsTable.status, "draft")),
    db
      .select({ value: count() })
      .from(playTranslationsTable)
      .where(eq(playTranslationsTable.status, "published")),
    db
      .select({ value: count() })
      .from(playTranslationsTable)
      .where(eq(playTranslationsTable.status, "draft")),
  ]);

  const coverageParts = await Promise.all(
    LOCALES.map(async (locale) => {
      const [pub, draft] = await Promise.all([
        db
          .select({ value: count() })
          .from(fairyTaleTranslationsTable)
          .where(
            and(
              eq(fairyTaleTranslationsTable.locale, locale),
              eq(fairyTaleTranslationsTable.status, "published"),
            ),
          ),
        db
          .select({ value: count() })
          .from(fairyTaleTranslationsTable)
          .where(
            and(
              eq(fairyTaleTranslationsTable.locale, locale),
              eq(fairyTaleTranslationsTable.status, "draft"),
            ),
          ),
      ]);
      return { locale, published: Number(pub[0]?.value ?? 0), draft: Number(draft[0]?.value ?? 0) };
    }),
  );

  res.json({
    publishedFairyTales: Number(ftPublished[0]?.value ?? 0),
    draftFairyTales: Number(ftDraft[0]?.value ?? 0),
    publishedPlays: Number(plPublished[0]?.value ?? 0),
    draftPlays: Number(plDraft[0]?.value ?? 0),
    translationCoverage: coverageParts,
  });
});

export default router;
