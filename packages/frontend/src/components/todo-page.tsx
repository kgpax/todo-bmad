"use client";

import type { Todo } from "@todo-bmad/shared";
import { EmptyState } from "@/components/empty-state";
import { TodoInput } from "@/components/todo-input";
import { TodoList } from "@/components/todo-list";
import { useTodos } from "@/hooks/use-todos";

interface TodoPageProps {
  initialTodos: Todo[];
  emptyMessage: string;
}

export function TodoPage({ initialTodos, emptyMessage }: TodoPageProps) {
  const { todos, addTodo, toggleTodo, deleteTodo, isCreating, placeholderContext } = useTodos(initialTodos);

  return (
    <div className="pt-8 md:pt-12 lg:pt-16 flex flex-col gap-4">
      <TodoInput
        onSubmit={addTodo}
        placeholderContext={placeholderContext}
        disabled={isCreating}
      />
      {todos.length > 0 ? (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </div>
  );
}
