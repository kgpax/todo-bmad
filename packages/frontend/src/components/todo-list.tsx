import type { Todo } from "@todo-bmad/shared";
import { TodoItem } from "@/components/todo-item";

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  return (
    <div role="list" aria-live="polite" aria-label="Todo list" className="flex flex-col gap-3">
      {todos.map((todo) => (
        <div key={todo.id} role="listitem">
          <TodoItem todo={todo} />
        </div>
      ))}
    </div>
  );
}
