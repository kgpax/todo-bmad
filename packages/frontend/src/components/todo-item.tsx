"use client";

import { X } from "lucide-react";
import type { Todo } from "@todo-bmad/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { formatTimestamp } from "@/lib/utils";
import { ErrorCallout } from "@/components/error-callout";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  pendingAction?: "creating" | "toggling" | "deleting";
  error?: string;
  errorType?: "toggle" | "delete";
}

export function TodoItem({ todo, onToggle, onDelete, pendingAction, error, errorType }: TodoItemProps) {
  const isToggling = pendingAction === "toggling";
  const isDeleting = pendingAction === "deleting";

  const cardOpacity = isDeleting
    ? "opacity-50"
    : todo.completed
      ? "opacity-70"
      : "";

  const calloutId = `error-callout-${todo.id}`;

  return (
    <>
      <div
        data-completed={todo.completed}
        data-pending-deleting={isDeleting ? "true" : undefined}
        data-error-animate={error ? "true" : undefined}
        aria-describedby={error ? calloutId : undefined}
        className={[
          "bg-surface rounded-xl p-4 flex items-start gap-3",
          "transition-[transform,box-shadow,opacity] duration-(--duration-fast) ease-out",
          "[box-shadow:var(--shadow-resting)] hover:[box-shadow:var(--shadow-hover)]",
          "hover:[-webkit-transform:translateY(-1px)] hover:transform-[translateY(-1px)]",
          "motion-reduce:hover:transform-none motion-reduce:hover:opacity-90",
          cardOpacity,
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
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          disabled={!!pendingAction}
          aria-label={`Delete: ${todo.text}`}
          className={[
            "shrink-0 p-1.5 rounded-md transition-[opacity,color] duration-(--duration-fast)",
            "opacity-40 hover:opacity-100 hover:text-error focus:opacity-100 focus:text-error",
            "focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
            "disabled:pointer-events-none",
          ].join(" ")}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      {error && errorType && (
        <ErrorCallout
          type={errorType}
          id={calloutId}
        />
      )}
    </>
  );
}
