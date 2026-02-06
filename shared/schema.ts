
import { pgTable, text, serial, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // The "ID" or Name
  createdAt: timestamp("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  category: text("category").notNull(), // 'strength', 'run', 'surf', 'maint', 'breath'
  date: date("date").notNull(), // YYYY-MM-DD for grouping
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users);
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });

// === EXPLICIT TYPES ===
export type User = typeof users.$inferSelect;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// API Request/Response Types
export type CreateUserRequest = { name: string };
export type CreateLogRequest = { category: string; date: string }; // Date as YYYY-MM-DD

export interface WeeklyStatsResponse {
  strengthCount: number; // Target 2
  runCount: number;      // Target 2
  habits: {
    date: string;        // YYYY-MM-DD
    surf: boolean;
    maint: boolean;
    breath: boolean;
  }[];
}
