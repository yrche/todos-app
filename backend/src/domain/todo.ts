import { CategoryDto } from "./category.js";

export type TodoDto = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  category: CategoryDto;
};
