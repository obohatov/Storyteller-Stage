import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Fairy Tales
// ---------------------------------------------------------------------------

export const fairyTalesTable = pgTable("fairy_tales", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  ageRecommendation: text("age_recommendation"),
  estimatedReadingTime: integer("estimated_reading_time"),
  themes: text("themes").array(),
  coverImagePath: text("cover_image_path"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const fairyTaleTranslationsTable = pgTable(
  "fairy_tale_translations",
  {
    id: serial("id").primaryKey(),
    fairyTaleId: integer("fairy_tale_id")
      .notNull()
      .references(() => fairyTalesTable.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(), // en | uk | ru | nl
    /** draft | published | archived */
    status: text("status").notNull().default("draft"),
    title: text("title").notNull(),
    blurb: text("blurb"),
    body: text("body"), // HTML from Tiptap
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("fairy_tale_translations_tale_locale_idx").on(
      t.fairyTaleId,
      t.locale,
    ),
  ],
);

export const insertFairyTaleSchema = createInsertSchema(fairyTalesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertFairyTaleTranslationSchema = createInsertSchema(
  fairyTaleTranslationsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export type FairyTale = typeof fairyTalesTable.$inferSelect;
export type InsertFairyTale = z.infer<typeof insertFairyTaleSchema>;
export type FairyTaleTranslation =
  typeof fairyTaleTranslationsTable.$inferSelect;
export type InsertFairyTaleTranslation = z.infer<
  typeof insertFairyTaleTranslationSchema
>;

// ---------------------------------------------------------------------------
// Plays
// ---------------------------------------------------------------------------

export const playsTable = pgTable("plays", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  genre: text("genre"),
  targetAudience: text("target_audience"),
  estimatedDuration: integer("estimated_duration"), // minutes
  castSize: text("cast_size"),
  /** public | excerpt_only | on_request */
  scriptAvailability: text("script_availability")
    .notNull()
    .default("on_request"),
  stagingComplexity: text("staging_complexity"),
  productionHistory: text("production_history"),
  awards: text("awards"),
  coverImagePath: text("cover_image_path"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const playTranslationsTable = pgTable(
  "play_translations",
  {
    id: serial("id").primaryKey(),
    playId: integer("play_id")
      .notNull()
      .references(() => playsTable.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    /** draft | published | archived */
    status: text("status").notNull().default("draft"),
    title: text("title").notNull(),
    logline: text("logline"),
    synopsis: text("synopsis"), // HTML from Tiptap
    excerpt: text("excerpt"),
    stagingNotes: text("staging_notes"),
    productionInfo: text("production_info"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("play_translations_play_locale_idx").on(t.playId, t.locale),
  ],
);

export const insertPlaySchema = createInsertSchema(playsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPlayTranslationSchema = createInsertSchema(
  playTranslationsTable,
).omit({ id: true, createdAt: true, updatedAt: true });

export type Play = typeof playsTable.$inferSelect;
export type InsertPlay = z.infer<typeof insertPlaySchema>;
export type PlayTranslation = typeof playTranslationsTable.$inferSelect;
export type InsertPlayTranslation = z.infer<typeof insertPlayTranslationSchema>;

// ---------------------------------------------------------------------------
// About (one row per locale – no parent table needed)
// ---------------------------------------------------------------------------

export const aboutTranslationsTable = pgTable("about_translations", {
  id: serial("id").primaryKey(),
  locale: text("locale").notNull().unique(), // en | uk | ru | nl
  body: text("body"), // HTML from Tiptap
  authorPhotoPath: text("author_photo_path"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertAboutTranslationSchema = createInsertSchema(
  aboutTranslationsTable,
).omit({ id: true, updatedAt: true });

export type AboutTranslation = typeof aboutTranslationsTable.$inferSelect;
export type InsertAboutTranslation = z.infer<
  typeof insertAboutTranslationSchema
>;
