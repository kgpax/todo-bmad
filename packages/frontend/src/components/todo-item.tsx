import type { Todo } from "@todo-bmad/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { formatTimestamp } from "@/lib/utils";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  pendingAction?: "creating" | "toggling" | "deleting";
}

export function TodoItem({ todo, onToggle, pendingAction }: TodoItemProps) {
  const isToggling = pendingAction === "toggling";

  return (
    <div
      data-completed={todo.completed}
      className={[
        "bg-surface rounded-xl p-4 flex items-start gap-3",
        "transition-[transform,box-shadow,opacity] duration-(--duration-fast) ease-out",
        "[box-shadow:var(--shadow-resting)] hover:[box-shadow:var(--shadow-hover)]",
        "hover:[-webkit-transform:translateY(-1px)] hover:transform-[translateY(-1px)]",
        "motion-reduce:hover:transform-none motion-reduce:hover:opacity-90",
        todo.completed ? "opacity-70" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pt-0.5 shrink-0">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          aria-label={
            todo.completed
              ? `Mark ${todo.text} as active`
              : `Mark ${todo.text} as complete`
          }
          pending={isToggling}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={[
            "transition-[text-decoration-color] ease-in-out",
            "duration-[var(--duration-slow)]",
            todo.completed
              ? "line-through text-text-secondary [text-decoration-color:currentColor]"
              : "text-text-primary line-through [text-decoration-color:transparent]",
          ].join(" ")}
        >
          {todo.text}
        </p>
        <p className="text-text-secondary text-sm mt-1 text-right">
          {formatTimestamp(todo.createdAt)}
        </p>
      </div>
    </div>
  );
}
