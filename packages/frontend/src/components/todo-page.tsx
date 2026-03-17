"use client";

import type { Todo } from "@todo-bmad/shared";
import { EmptyState } from "@/components/empty-state";

interface TodoPageProps {
  initialTodos: Todo[];
  emptyMessage: string;
}

export function TodoPage({ initialTodos, emptyMessage }: TodoPageProps) {
  if (initialTodos.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <ul>
      {initialTodos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
