"use client";

import { useState, useRef, useEffect } from "react";
import type { Todo, ApiError } from "@todo-bmad/shared";
import { createTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo, fetchTodosClient } from "@/lib/api";
import { revalidateHome } from "@/lib/actions";

export interface TodoWithMeta extends Todo {
  pendingAction?: "creating" | "toggling" | "deleting";
  error?: string;
  errorType?: "toggle" | "delete";
}

export function useTodos(initialTodos: Todo[], initialFetchFailed = false) {
  const [todos, setTodos] = useState<TodoWithMeta[]>(initialTodos);
  const [loadError, setLoadError] = useState(initialFetchFailed);
  const [isLoading, setIsLoading] = useState(false);
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

  async function retryLoad() {
    setIsLoading(true);
    setLoadError(false);
    try {
      const freshTodos = await fetchTodosClient();
      setTodos(freshTodos);
      await revalidateHome();
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function clearCreateError() {
    setCreateError(null);
  }

  async function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isCreating) return;

    setIsCreating(true);
    setCachedCreateText(trimmed);
    setCreateError(null);

    try {
      const newTodo = await createTodo(trimmed);
      setTodos((prev) => [newTodo, ...prev]);
      setLoadError(false);
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
            ? {
                ...t,
                pendingAction: undefined,
                error: apiError?.message || "Failed to update todo",
                errorType: "toggle" as const,
              }
            : t
        )
      );
    }
  }

  async function deleteTodo(id: string) {
    const target = todos.find((t) => t.id === id);
    if (!target || target.pendingAction) return;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, pendingAction: "deleting" as const, error: undefined } : t
      )
    );

    try {
      await apiDeleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      await revalidateHome();
    } catch (err) {
      const apiError = err as ApiError;
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                pendingAction: undefined,
                error: apiError?.message || "Failed to delete todo",
                errorType: "delete" as const,
              }
            : t
        )
      );
    }
  }

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    isCreating,
    justAdded,
    placeholderContext,
    createError,
    cachedCreateText,
    clearCreateError,
    loadError,
    isLoading,
    retryLoad,
  };
}
