import { pgTable, text } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const defaultCategories = [
  { id: "work", name: "Work" },
  { id: "personal", name: "Personal" },
  { id: "home", name: "Home" },
  { id: "study", name: "Study" },
];
