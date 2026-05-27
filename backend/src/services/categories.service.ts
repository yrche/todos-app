import { CategoriesRepository } from "@infrastructure/database/repository/categories.repository.js";

const categoriesRepository = new CategoriesRepository();

export async function listCategories() {
  return categoriesRepository.findAll();
}
