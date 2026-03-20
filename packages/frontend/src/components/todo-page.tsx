"use client";

import type { Todo } from "@todo-bmad/shared";
import { EmptyState } from "@/components/empty-state";
import { LoadError } from "@/components/load-error";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { TodoInput } from "@/components/todo-input";
import { TodoList } from "@/components/todo-list";
import { useTodos } from "@/hooks/use-todos";

interface TodoPageProps {
  initialTodos: Todo[];
  emptyMessage: string;
  fetchFailed?: boolean;
}

export function TodoPage({ initialTodos, emptyMessage, fetchFailed = false }: TodoPageProps) {
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    isCreating,
    placeholderContext,
    createError,
    cachedCreateText,
    clearCreateError,
    loadError,
    isLoading,
    retryLoad,
  } = useTodos(initialTodos, fetchFailed);

  return (
    <div className="pt-8 md:pt-12 lg:pt-16 flex flex-col gap-4">
      <TodoInput
        onSubmit={addTodo}
        placeholderContext={placeholderContext}
        disabled={isCreating}
        createError={createError}
        cachedCreateText={cachedCreateText}
        onClearError={clearCreateError}
      />
      {isLoading ? (
        <SkeletonLoader />
      ) : loadError ? (
        <LoadError onRetry={retryLoad} />
      ) : todos.length > 0 ? (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </div>
  );
}
