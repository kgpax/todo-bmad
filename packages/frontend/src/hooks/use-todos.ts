"use client";

import { useState, useRef, useEffect } from "react";
import type { Todo, ApiError } from "@todo-bmad/shared";
import { createTodo, toggleTodo as apiToggleTodo } from "@/lib/api";
import { revalidateHome } from "@/lib/actions";

export interface TodoWithMeta extends Todo {
  pendingAction?: "creating" | "toggling" | "deleting";
  error?: string;
}

export function useTodos(initialTodos: Todo[]) {
  const [todos, setTodos] = useState<TodoWithMeta[]>(initialTodos);
  const [isCreating, setIsCreating] = useState(false);
  const [cachedCreateText, setCachedCreateText] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const justAddedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (justAddedTimerRef.current) clearTimeout(justAddedTimerRef.current);
    };
  }, []);

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
      if (justAddedTimerRef.current) clearTimeout(justAddedTimerRef.current);
      justAddedTimerRef.current = setTimeout(() => setJustAdded(false), 4000);
      await revalidateHome();
    } catch (err) {
      const apiError = err as ApiError;
      setCreateError(apiError?.message || "Failed to create todo");
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleTodo(id: string) {
    const target = todos.find((t) => t.id === id);
    if (!target || target.pendingAction) return;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, pendingAction: "toggling" as const, error: undefined } : t
      )
    );

    try {
      const updated = await apiToggleTodo(id, !target.completed);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...updated, pendingAction: undefined, error: undefined } : t
        )
      );
      await revalidateHome();
    } catch (err) {
      const apiError = err as ApiError;
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, pendingAction: undefined, error: apiError?.message || "Failed to update todo" }
            : t
        )
      );
    }
  }

  return { todos, addTodo, toggleTodo, isCreating, justAdded, placeholderContext, createError, cachedCreateText };
}
