import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { categories } from "./categories.schema.js";

export const todos = pgTable("todos", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
