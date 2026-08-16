import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { playsTable } from "./content";

/**
 * Unified inbox for contact messages and script requests.
 * type-specific fields are nullable and only used for the relevant type.
 */
export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  /** 'contact' | 'script_request' */
  type: text("type").notNull(),
  /** 'new' | 'read' | 'archived' */
  status: text("status").notNull().default("new"),
  /** en | uk | ru | nl */
  locale: text("locale").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),

  // ── contact-specific ────────────────────────────────────────────────────
  /** general|publishing|translation|festival|collaboration|reader|other */
  enquiryCategory: text("enquiry_category"),

  // ── script_request-specific ─────────────────────────────────────────────
  playId: integer("play_id").references(() => playsTable.id, {
    onDelete: "set null",
  }),
  organization: text("organization"),
  role: text("role"),
  city: text("city"),
  country: text("country"),
  /** reading|production|festival|publishing|translation|education|other */
  intendedUse: text("intended_use"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Message = typeof messagesTable.$inferSelect;
