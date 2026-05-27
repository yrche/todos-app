import { eq } from "drizzle-orm";
import { db } from "../database.providers.js";
import { categories } from "../schemas/index.js";

export class CategoriesRepository {
  async findAll() {
    return db.select().from(categories).orderBy(categories.name);
  }

  async findById(id: string) {
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return rows[0] ?? null;
  }
}
