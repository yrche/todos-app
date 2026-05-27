import { count, desc, eq } from "drizzle-orm";
import { db } from "../database.providers.js";
import { categories, todos } from "../schemas/index.js";

export type TodoRow = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  categoryId: string;
  categoryName: string;
};

export class TodosRepository {
  async findAll(categoryId?: string) {
    const query = db
      .select({
        id: todos.id,
        text: todos.text,
        completed: todos.isCompleted,
        createdAt: todos.createdAt,
        categoryId: categories.id,
        categoryName: categories.name,
      })
      .from(todos)
      .innerJoin(categories, eq(todos.categoryId, categories.id));

    if (categoryId) {
      query.where(eq(todos.categoryId, categoryId));
    }

    const rows = await query.orderBy(desc(todos.createdAt));

    return rows;
  }

  async findById(id: string) {
    const rows = await db
      .select({
        id: todos.id,
        text: todos.text,
        completed: todos.isCompleted,
        createdAt: todos.createdAt,
        categoryId: categories.id,
        categoryName: categories.name,
      })
      .from(todos)
      .innerJoin(categories, eq(todos.categoryId, categories.id))
      .where(eq(todos.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(payload: { id: string; text: string; categoryId: string }) {
    await db.insert(todos).values({
      id: payload.id,
      text: payload.text,
      categoryId: payload.categoryId,
    });

    return this.findById(payload.id);
  }

  async updateStatus(id: string, completed: boolean) {
    await db
      .update(todos)
      .set({ isCompleted: completed })
      .where(eq(todos.id, id));

    return this.findById(id);
  }

  async deleteById(id: string) {
    await db.delete(todos).where(eq(todos.id, id));
  }

  async countByCategory(categoryId: string) {
    const rows = await db
      .select({ count: count() })
      .from(todos)
      .where(eq(todos.categoryId, categoryId));

    return Number(rows[0]?.count ?? 0);
  }
}
