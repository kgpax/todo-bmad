"use client";

import type { Todo } from "@todo-bmad/shared";
import { EmptyState } from "@/components/empty-state";

interface TodoPageProps {
  initialTodos: Todo[];
  emptyMessage: string;
}

export function TodoPage({ initialTodos, emptyMessage }: TodoPageProps) {
  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-6">
      {initialTodos.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul>
          {initialTodos.map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
