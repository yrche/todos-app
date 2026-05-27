import { Request, Response } from "express";
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodoStatus,
} from "@services/todos.service.js";

export async function getTodos(req: Request, res: Response) {
  const categoryParam =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const category = categoryParam && categoryParam !== "all" ? categoryParam : undefined;

  const todos = await listTodos(category);
  res.json(todos);
}

export async function postTodo(req: Request, res: Response) {
  const { text, categoryId } = req.body as {
    text: string;
    categoryId: string;
  };

  const todo = await createTodo({ text, categoryId });
  res.status(201).json(todo);
}

export async function patchTodo(req: Request, res: Response) {
  const { completed } = req.body as { completed: boolean };
  const todo = await updateTodoStatus(req.params.id, completed);
  res.json(todo);
}

export async function removeTodo(req: Request, res: Response) {
  await deleteTodo(req.params.id);
  res.status(204).send();
}
