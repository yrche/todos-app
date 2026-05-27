import { randomUUID } from "node:crypto";
import { ApiError } from "@exeptions/api.error.js";
import { CategoriesRepository } from "@infrastructure/database/repository/categories.repository.js";
import {
  TodosRepository,
  TodoRow,
} from "@infrastructure/database/repository/todos.repository.js";
import { TodoDto } from "@domain/todo.js";

const todosRepository = new TodosRepository();
const categoriesRepository = new CategoriesRepository();

function mapTodo(row: TodoRow): TodoDto {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.createdAt,
    category: {
      id: row.categoryId,
      name: row.categoryName,
    },
  };
}

export async function listTodos(categoryId?: string) {
  const rows = await todosRepository.findAll(categoryId);
  return rows.map(mapTodo);
}

export async function createTodo(payload: {
  text: string;
  categoryId: string;
}) {
  const text = payload.text?.trim();
  if (!text) {
    throw ApiError.badRequest("Task text is required.");
  }

  if (!payload.categoryId) {
    throw ApiError.badRequest("Category is required.");
  }

  const category = await categoriesRepository.findById(payload.categoryId);
  if (!category) {
    throw ApiError.badRequest("Unknown category.");
  }

  const count = await todosRepository.countByCategory(payload.categoryId);
  if (count >= 5) {
    throw ApiError.badRequest("This category already has 5 tasks.");
  }

  const created = await todosRepository.create({
    id: randomUUID(),
    text,
    categoryId: payload.categoryId,
  });

  if (!created) {
    throw new ApiError(500, "Failed to create task.");
  }

  return mapTodo(created);
}

export async function updateTodoStatus(id: string, completed: boolean) {
  if (typeof completed !== "boolean") {
    throw ApiError.badRequest("Completed flag is required.");
  }

  const updated = await todosRepository.updateStatus(id, completed);
  if (!updated) {
    throw ApiError.notFound("Task not found.");
  }

  return mapTodo(updated);
}

export async function deleteTodo(id: string) {
  const existing = await todosRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Task not found.");
  }

  await todosRepository.deleteById(id);
}
