
import { storage } from "./storage";
import { format, subDays } from "date-fns";

async function seed() {
  console.log("Seeding database...");
  
  // Create a default user if not exists
  let user = await storage.getUserByName("PLAYER1");
  if (!user) {
    user = await storage.createUser({ name: "PLAYER1" });
    console.log("Created user PLAYER1");
  } else {
    console.log("User PLAYER1 exists");
  }

  // Add some logs for the current week to show progress
  const today = new Date();
  const userId = user.id;

  // Log 1 strength session yesterday
  await storage.createLog({
    userId,
    category: "strength",
    date: format(subDays(today, 1), 'yyyy-MM-dd')
  });

  // Log 1 run today
  await storage.createLog({
    userId,
    category: "run",
    date: format(today, 'yyyy-MM-dd')
  });

  // Log some habits
  await storage.createLog({
    userId,
    category: "surf",
    date: format(today, 'yyyy-MM-dd')
  });

  console.log("Seeding complete!");
}

seed().catch(console.error);
