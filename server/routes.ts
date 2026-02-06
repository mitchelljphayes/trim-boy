
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { startOfWeek, endOfWeek, format } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.users.getOrCreate.path, async (req, res) => {
    try {
      const input = api.users.getOrCreate.input.parse(req.body);
      let user = await storage.getUserByName(input.name);
      
      if (!user) {
        user = await storage.createUser(input);
        res.status(201).json(user);
      } else {
        res.status(200).json(user);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.logs.getWeekly.path, async (req, res) => {
    const userIdStr = req.params.userId;
    const userId = parseInt(userIdStr);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Calculate start (Monday) and end (Sunday) of current week
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(now, { weekStartsOn: 1 });
    
    const startDate = format(start, 'yyyy-MM-dd');
    const endDate = format(end, 'yyyy-MM-dd');

    const logs = await storage.getLogsForWeek(userId, startDate, endDate);

    // Process logs into required format
    const strengthCount = logs.filter(l => l.category === 'strength').length;
    const runCount = logs.filter(l => l.category === 'run').length;

    // Build habits map
    const habitsMap = new Map<string, { surf: boolean, maint: boolean, breath: boolean }>();
    
    // Initialize all days of week
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      habitsMap.set(dateStr, { surf: false, maint: false, breath: false });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    logs.forEach(log => {
      const dayHabits = habitsMap.get(log.date);
      if (dayHabits) {
        if (log.category === 'surf') dayHabits.surf = true;
        if (log.category === 'maint') dayHabits.maint = true;
        if (log.category === 'breath') dayHabits.breath = true;
      }
    });

    const habits = Array.from(habitsMap.entries()).map(([date, status]) => ({
      date,
      ...status
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      strengthCount,
      runCount,
      habits
    });
  });

  return httpServer;
}
