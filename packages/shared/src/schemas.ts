import { z } from "zod";

import { MAX_TEXT_LENGTH } from "./constants";

export const createTodoSchema = z.object({
  text: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
});

export const updateTodoSchema = z.object({
  completed: z.boolean(),
});

export const todoSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
});
