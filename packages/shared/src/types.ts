import { z } from "zod";

import { todoSchema, createTodoSchema, updateTodoSchema } from "./schemas";

export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoRequest = z.infer<typeof createTodoSchema>;
export type UpdateTodoRequest = z.infer<typeof updateTodoSchema>;

export interface ApiError {
  error: string;
  message: string;
}
