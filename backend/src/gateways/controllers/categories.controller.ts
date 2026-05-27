import { NextFunction, Request, Response } from "express";
import { listCategories } from "@services/categories.service.js";

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories = await listCategories();
    return res.json(categories);
  } catch (err) {
    next(err);
  }
}
