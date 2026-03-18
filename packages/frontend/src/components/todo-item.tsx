import type { Todo } from "@todo-bmad/shared";
import { formatTimestamp } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div
      className="bg-surface rounded-xl p-4 transition-[transform,box-shadow] duration-(--duration-fast) ease-out [box-shadow:var(--shadow-resting)] hover:[box-shadow:var(--shadow-hover)] hover:[-webkit-transform:translateY(-1px)] hover:transform-[translateY(-1px)] motion-reduce:hover:transform-none motion-reduce:hover:opacity-90"
    >
      <p className="text-text-primary">{todo.text}</p>
      <p className="text-text-secondary text-sm mt-1 text-right">
        {formatTimestamp(todo.createdAt)}
      </p>
    </div>
  );
}
