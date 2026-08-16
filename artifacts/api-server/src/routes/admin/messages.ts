import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, messagesTable, playsTable, playTranslationsTable } from "@workspace/db";

const router: IRouter = Router();

// ── GET /api/admin/messages ───────────────────────────────────────────────────

router.get("/admin/messages", async (req: Request, res: Response): Promise<void> => {
  const typeFilter   = req.query.type as string | undefined;
  const statusFilter = req.query.status as string | undefined;

  const conditions = [];
  if (typeFilter && ["contact", "script_request"].includes(typeFilter)) {
    conditions.push(eq(messagesTable.type, typeFilter));
  }
  if (statusFilter && ["new", "read", "archived"].includes(statusFilter)) {
    conditions.push(eq(messagesTable.status, statusFilter));
  }

  const rows = await db
    .select({
      id:               messagesTable.id,
      type:             messagesTable.type,
      status:           messagesTable.status,
      locale:           messagesTable.locale,
      name:             messagesTable.name,
      email:            messagesTable.email,
      enquiryCategory:  messagesTable.enquiryCategory,
      playId:           messagesTable.playId,
      organization:     messagesTable.organization,
      createdAt:        messagesTable.createdAt,
      playTitle:        playTranslationsTable.title,
    })
    .from(messagesTable)
    .leftJoin(
      playTranslationsTable,
      and(
        eq(playTranslationsTable.playId, messagesTable.playId!),
        eq(playTranslationsTable.locale, messagesTable.locale),
      ),
    )
    .where(conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...conditions) : undefined)
    .orderBy(desc(messagesTable.createdAt));

  res.json(rows);
});

// ── GET /api/admin/messages/:id ───────────────────────────────────────────────

router.get("/admin/messages/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id." }); return; }

  // Fetch the message itself
  const msgRows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.id, id))
    .limit(1);

  if (!msgRows.length) { res.status(404).json({ error: "Message not found." }); return; }
  const msg = msgRows[0];

  // If it's a script_request, fetch the play title (try matching locale first, then any published)
  let playTitle: string | null = null;
  if (msg.playId) {
    const ptRows = await db
      .select({ title: playTranslationsTable.title, locale: playTranslationsTable.locale })
      .from(playTranslationsTable)
      .where(
        and(
          eq(playTranslationsTable.playId, msg.playId),
          eq(playTranslationsTable.status, "published"),
        ),
      );

    const localMatch = ptRows.find((r) => r.locale === msg.locale);
    playTitle = localMatch?.title ?? ptRows[0]?.title ?? null;

    // Fallback: check all locales from the plays table
    if (!playTitle) {
      const playRows = await db
        .select({ slug: playsTable.slug })
        .from(playsTable)
        .where(eq(playsTable.id, msg.playId))
        .limit(1);
      playTitle = playRows[0]?.slug ?? null;
    }
  }

  res.json({ ...msg, playTitle });
});

// ── PATCH /api/admin/messages/:id ─────────────────────────────────────────────

router.patch("/admin/messages/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id." }); return; }

  const { status } = req.body ?? {};
  if (!["new", "read", "archived"].includes(status)) {
    res.status(400).json({ error: "status must be new | read | archived." });
    return;
  }

  const [updated] = await db
    .update(messagesTable)
    .set({ status })
    .where(eq(messagesTable.id, id))
    .returning({ id: messagesTable.id, status: messagesTable.status });

  if (!updated) { res.status(404).json({ error: "Message not found." }); return; }
  res.json(updated);
});

// ── DELETE /api/admin/messages/:id ────────────────────────────────────────────

router.delete("/admin/messages/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id." }); return; }

  const [deleted] = await db
    .delete(messagesTable)
    .where(eq(messagesTable.id, id))
    .returning({ id: messagesTable.id });

  if (!deleted) { res.status(404).json({ error: "Message not found." }); return; }
  res.json({ ok: true });
});

export default router;
