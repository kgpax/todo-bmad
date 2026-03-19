import type { TodoWithMeta } from "@/hooks/use-todos";
import { TodoItem } from "@/components/todo-item";

interface TodoListProps {
  todos: TodoWithMeta[];
  onToggle: (id: string) => void;
}

export function TodoList({ todos, onToggle }: TodoListProps) {
  return (
    <div role="list" aria-live="polite" aria-label="Todo list" className="flex flex-col gap-3">
      {todos.map((todo) => (
        <div key={todo.id} role="listitem">
          <TodoItem todo={todo} onToggle={onToggle} pendingAction={todo.pendingAction} />
        </div>
      ))}
    </div>
  );
}
