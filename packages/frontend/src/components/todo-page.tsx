"use client";

import type { Todo } from "@todo-bmad/shared";
import { EmptyState } from "@/components/empty-state";

interface TodoPageProps {
  initialTodos: Todo[];
}

export function TodoPage({ initialTodos }: TodoPageProps) {
  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-6">
      {initialTodos.length === 0 ? (
        <EmptyState />
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
