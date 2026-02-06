
import { pgTable, text, serial, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  category: text("category").notNull(), // 'strength', 'run', 'surf', 'maint', 'breath'
  date: date("date").notNull(), // YYYY-MM-DD for grouping
  metadata: jsonb("metadata"), // optional JSON for surf/run details
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });

// === EXPLICIT TYPES ===
export type User = typeof users.$inferSelect;
export type Log = typeof logs.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLog = z.infer<typeof insertLogSchema>;

export type CreateUserRequest = { name: string };
export type CreateLogRequest = { category: string; date: string; metadata?: Record<string, unknown> };

export interface WeeklyStatsResponse {
  strengthCount: number;
  runCount: number;
  habits: {
    date: string;
    surf: boolean;
    maint: boolean;
    breath: boolean;
  }[];
}
