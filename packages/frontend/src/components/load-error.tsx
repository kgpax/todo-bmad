"use client";

import { useState } from "react";
import { pickRandom } from "@/lib/utils";

export const LOAD_ERROR_MESSAGES = [
  "Couldn't reach your todos. They're probably fine — want to try again?",
  "The connection stumbled. Your list is out there somewhere.",
  "Something went sideways. Let's give it another shot.",
] as const;

interface LoadErrorProps {
  onRetry: () => void;
}

export function LoadError({ onRetry }: LoadErrorProps) {
  const [message] = useState(() => pickRandom(LOAD_ERROR_MESSAGES));

  return (
    <div
      id="load-error"
      role="alert"
      className="bg-surface rounded-xl p-6 text-center [box-shadow:var(--shadow-resting)]"
    >
      <p className="text-text-secondary mb-4">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        aria-label="Retry loading todos"
        className="bg-accent text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--color-accent)]"
      >
        Try again
      </button>
    </div>
  );
}
