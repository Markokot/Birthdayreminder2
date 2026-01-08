import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We define the table schema for type inference and validation, 
// even though we are using a JSON file for storage.
export const birthdays = pgTable("birthdays", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // Storing date as ISO string (YYYY-MM-DD) for sorting, or simplified MM-DD
  // User example: "15 июля". We'll use a string for flexibility but recommend standard format for sorting
  birthDate: text("birth_date").notNull(), 
  description: text("description"),
  isGiftRequired: boolean("is_gift_required").default(false),
  isReminderSet: boolean("is_reminder_set").default(false),
});

export const insertBirthdaySchema = createInsertSchema(birthdays).omit({ id: true });

export type InsertBirthday = z.infer<typeof insertBirthdaySchema>;
export type Birthday = typeof birthdays.$inferSelect;

// Login Schema
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
