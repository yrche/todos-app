import { fileURLToPath } from "node:url";
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./database.providers.js";
import { CategoriesRepository } from "./repository/categories.repository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.join(__dirname, "../../../drizzle");

const categoriesRepository = new CategoriesRepository();

export async function initializeDatabase() {
  await migrate(db, { migrationsFolder });
  await categoriesRepository.ensureDefaults();
}
