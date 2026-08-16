import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, fairyTaleTranslationsTable, playTranslationsTable, messagesTable } from "@workspace/db";
import { isAdminUser } from "../../lib/adminGuard";

const router: IRouter = Router();

const LOCALES = ["en", "uk", "ru", "nl"];

/**
 * GET /admin/me
 */
router.get("/admin/me", (req: Request, res: Response): void => {
  const user = req.user as {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  res.json({ isAdmin: true, user });
});

/**
 * GET /admin/dashboard
 */
router.get("/admin/dashboard", async (_req: Request, res: Response): Promise<void> => {
  const [ftPublished, ftDraft, plPublished, plDraft, newContact, newScript] = await Promise.all([
    db.select({ value: count() }).from(fairyTaleTranslationsTable).where(eq(fairyTaleTranslationsTable.status, "published")),
    db.select({ value: count() }).from(fairyTaleTranslationsTable).where(eq(fairyTaleTranslationsTable.status, "draft")),
    db.select({ value: count() }).from(playTranslationsTable).where(eq(playTranslationsTable.status, "published")),
    db.select({ value: count() }).from(playTranslationsTable).where(eq(playTranslationsTable.status, "draft")),
    db.select({ value: count() }).from(messagesTable).where(and(eq(messagesTable.type, "contact"), eq(messagesTable.status, "new"))),
    db.select({ value: count() }).from(messagesTable).where(and(eq(messagesTable.type, "script_request"), eq(messagesTable.status, "new"))),
  ]);

  const coverageParts = await Promise.all(
    LOCALES.map(async (locale) => {
      const [pub, draft] = await Promise.all([
        db.select({ value: count() }).from(fairyTaleTranslationsTable).where(and(eq(fairyTaleTranslationsTable.locale, locale), eq(fairyTaleTranslationsTable.status, "published"))),
        db.select({ value: count() }).from(fairyTaleTranslationsTable).where(and(eq(fairyTaleTranslationsTable.locale, locale), eq(fairyTaleTranslationsTable.status, "draft"))),
      ]);
      return { locale, published: Number(pub[0]?.value ?? 0), draft: Number(draft[0]?.value ?? 0) };
    }),
  );

  res.json({
    publishedFairyTales: Number(ftPublished[0]?.value ?? 0),
    draftFairyTales:     Number(ftDraft[0]?.value ?? 0),
    publishedPlays:      Number(plPublished[0]?.value ?? 0),
    draftPlays:          Number(plDraft[0]?.value ?? 0),
    newContactMessages:  Number(newContact[0]?.value ?? 0),
    newScriptRequests:   Number(newScript[0]?.value ?? 0),
    translationCoverage: coverageParts,
  });
});

export default router;
