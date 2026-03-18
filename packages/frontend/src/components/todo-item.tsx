import type { Todo } from "@todo-bmad/shared";
import { formatTimestamp } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div
      className="bg-surface rounded-xl p-4 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:[-webkit-transform:translateY(-1px)] hover:[transform:translateY(-1px)] motion-reduce:hover:[transform:none] motion-reduce:hover:opacity-90"
      style={{ boxShadow: "var(--shadow-resting)" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-hover)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-resting)";
      }}
    >
      <p className="text-text-primary">{todo.text}</p>
      <p className="text-text-secondary text-sm mt-1 text-right">
        {formatTimestamp(todo.createdAt)}
      </p>
    </div>
  );
}
