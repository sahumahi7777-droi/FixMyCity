import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const issueStatusEnum = pgEnum("issue_status", ["reported", "in-progress", "resolved"]);

export const issuesTable = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  digiPin: text("digi_pin").notNull(),
  location: text("location").notNull(),
  reporterName: text("reporter_name").notNull(),
  reporterEmail: text("reporter_email").notNull(),
  reporterContact: text("reporter_contact").notNull(),
  status: issueStatusEnum("status").notNull().default("reported"),
  reportCount: integer("report_count").notNull().default(1),
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertIssueSchema = createInsertSchema(issuesTable).omit({
  id: true,
  submittedAt: true,
  resolvedAt: true,
  adminNotes: true,
  reportCount: true,
  status: true,
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issuesTable.$inferSelect;
