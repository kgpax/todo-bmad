import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { TodoWithMeta } from "@/hooks/use-todos";
import { TodoItem } from "@/components/todo-item";

interface TodoListProps {
  todos: TodoWithMeta[];
  onToggle: (id: string) => void;
}

export function TodoList({ todos, onToggle }: TodoListProps) {
  const [animationParent] = useAutoAnimate({
    duration: 400,
    easing: "ease-in-out",
  });

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos
    .filter((t) => t.completed)
    .sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <div
      ref={animationParent}
      role="list"
      aria-live="polite"
      aria-label="Todo list"
      className="flex flex-col gap-3"
    >
      {activeTodos.map((todo) => (
        <div key={todo.id} role="listitem">
          <TodoItem todo={todo} onToggle={onToggle} pendingAction={todo.pendingAction} />
        </div>
      ))}
      {completedTodos.length > 0 && (
        <div
          key="completed-divider"
          role="separator"
          className="flex items-center gap-3 my-2 px-1"
        >
          <div className="flex-1 border-t border-text-placeholder/30" />
          <span className="text-xs tracking-widest uppercase text-text-secondary select-none">
            Completed
          </span>
          <div className="flex-1 border-t border-text-placeholder/30" />
        </div>
      )}
      {completedTodos.map((todo) => (
        <div key={todo.id} role="listitem">
          <TodoItem todo={todo} onToggle={onToggle} pendingAction={todo.pendingAction} />
        </div>
      ))}
    </div>
  );
}
