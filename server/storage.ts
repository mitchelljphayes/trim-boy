
import { db } from "./db";
import { users, logs, type User, type InsertUser, type Log, type InsertLog } from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLog(log: InsertLog): Promise<Log>;
  getLogsForWeek(userId: number, startDate: string, endDate: string): Promise<Log[]>;
  getAllLogs(userId: number): Promise<Log[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.name, name));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }

  async getLogsForWeek(userId: number, startDate: string, endDate: string): Promise<Log[]> {
    return await db.select()
      .from(logs)
      .where(
        and(
          eq(logs.userId, userId),
          gte(logs.date, startDate),
          lte(logs.date, endDate)
        )
      );
  }

  async getAllLogs(userId: number): Promise<Log[]> {
    return await db.select()
      .from(logs)
      .where(eq(logs.userId, userId))
      .orderBy(sql`${logs.date} DESC, ${logs.createdAt} DESC`);
  }
}

export const storage = new DatabaseStorage();
