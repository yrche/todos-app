import { Router } from "express";
import { getCategories } from "@gateways/controllers/categories.controller.js";
import { asyncHandler } from "@gateways/middlewares/async-handler.js";

const router = Router();

router.get("/", asyncHandler(getCategories));

export default router;
