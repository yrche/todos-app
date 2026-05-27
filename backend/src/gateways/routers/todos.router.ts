import { Router } from "express";
import {
  getTodos,
  patchTodo,
  postTodo,
  removeTodo,
} from "@gateways/controllers/todos.controller.js";
import { asyncHandler } from "@gateways/middlewares/async-handler.js";

const router = Router();

router.get("/", asyncHandler(getTodos));
router.post("/", asyncHandler(postTodo));
router.patch("/:id", asyncHandler(patchTodo));
router.delete("/:id", asyncHandler(removeTodo));

export default router;
