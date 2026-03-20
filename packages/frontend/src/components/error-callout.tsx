"use client";

import { useState } from "react";
import { pickRandom } from "@/lib/utils";

export type ErrorCalloutType = "create" | "toggle" | "delete";

const ERROR_COPY = {
  create: [
    "That one didn't stick. Give it another go?",
    "Couldn't save that one. Try again?",
    "Something got in the way. One more shot?",
  ],
  toggle: [
    "Hmm, couldn't update that one. Try again?",
    "That change didn't take. Give it another tap?",
    "Couldn't flip that one. Try once more?",
  ],
  delete: [
    "Wouldn't let go of that one. One more try?",
    "That one's holding on. Try again?",
    "Couldn't remove that one. Give it another go?",
  ],
} as const;

interface ErrorCalloutProps {
  type: ErrorCalloutType;
  id: string;
  message?: string;
  onRestore?: () => void;
}

export function ErrorCallout({ type, id, message, onRestore }: ErrorCalloutProps) {
  const [copy] = useState(() => pickRandom(ERROR_COPY[type]));

  return (
    <div
      id={id}
      role="alert"
      className="mt-2 text-sm text-error error-callout-fade-in"
    >
      <span>{message ?? copy}</span>
      {onRestore && (
        <button
          type="button"
          onClick={onRestore}
          className="ml-2 text-sm text-error underline focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
        >
          Restore
        </button>
      )}
    </div>
  );
}
