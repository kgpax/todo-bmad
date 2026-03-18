"use client";

import { useState } from "react";
import type { Todo, ApiError } from "@todo-bmad/shared";
import { createTodo } from "@/lib/api";
import { revalidateHome } from "@/lib/actions";

export function useTodos(initialTodos: Todo[]) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [isCreating, setIsCreating] = useState(false);
  const [cachedCreateText, setCachedCreateText] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const placeholderContext: "empty" | "hasItems" | "justAdded" = justAdded
    ? "justAdded"
    : todos.length === 0
      ? "empty"
      : "hasItems";

  async function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isCreating) return;

    setIsCreating(true);
    setCachedCreateText(trimmed);
    setCreateError(null);

    try {
      const newTodo = await createTodo(trimmed);
      setTodos((prev) => [newTodo, ...prev]);
      setCachedCreateText("");
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 4000);
      await revalidateHome();
    } catch (err) {
      const apiError = err as ApiError;
      setCreateError(apiError?.message || "Failed to create todo");
    } finally {
      setIsCreating(false);
    }
  }

  return { todos, addTodo, isCreating, justAdded, placeholderContext, createError, cachedCreateText };
}
