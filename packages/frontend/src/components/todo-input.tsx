"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { pickRandom, isDesktopDevice } from "@/lib/utils";
import {
  EMPTY_LIST_PLACEHOLDERS,
  HAS_ITEMS_PLACEHOLDERS,
  JUST_ADDED_PLACEHOLDERS,
} from "@/config/placeholders";

type PlaceholderContext = "empty" | "hasItems" | "justAdded";

interface TodoInputProps {
  onSubmit: (text: string) => void;
  placeholderContext: PlaceholderContext;
  disabled?: boolean;
}

function getPlaceholderBank(context: PlaceholderContext) {
  if (context === "justAdded") return JUST_ADDED_PLACEHOLDERS;
  if (context === "hasItems") return HAS_ITEMS_PLACEHOLDERS;
  return EMPTY_LIST_PLACEHOLDERS;
}

export function TodoInput({ onSubmit, placeholderContext, disabled }: TodoInputProps) {
  const [text, setText] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasDisabledRef = useRef(false);

  useEffect(() => {
    setPlaceholder(pickRandom(getPlaceholderBank(placeholderContext)));
  }, [placeholderContext]);

  // useLayoutEffect fires synchronously before the browser paints, so the
  // input is focused before the user ever sees the hydrated state — no delay.
  useLayoutEffect(() => {
    if (isDesktopDevice()) {
      /* istanbul ignore next -- inputRef.current is always attached for a mounted component */
      inputRef.current?.focus();
    }
  }, []);

  // When disabled becomes true (create in-flight), onBlur may not fire
  // reliably for a programmatically disabled element, leaving a stale focus
  // ring. Clear it explicitly. When disabled clears (create done), restore
  // focus so the user can immediately type their next todo.
  useEffect(() => {
    if (disabled) {
      setFocused(false);
      wasDisabledRef.current = true;
    } else if (wasDisabledRef.current) {
      /* istanbul ignore next -- inputRef.current is always attached for a mounted component */
      inputRef.current?.focus();
      wasDisabledRef.current = false;
    }
  }, [disabled]);

  function submitText() {
    const trimmed = text.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setText("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      submitText();
    } else if (e.key === "Escape") {
      setText("");
      /* istanbul ignore next -- inputRef.current is always attached for a mounted component */
      inputRef.current?.blur();
    }
  }

  return (
    <div
      className="bg-surface rounded-xl p-4 md:p-5 flex items-center gap-3 transition-shadow [box-shadow:var(--shadow-resting)] data-[focused=true]:[box-shadow:0_0_0_3px_var(--color-accent),var(--shadow-hover)]"
      data-focused={focused}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="New todo"
        className="flex-1 bg-transparent text-text-primary placeholder:text-text-placeholder outline-none text-base min-h-[44px]"
      />
      {text.trim().length > 0 && (
        <button
          onClick={submitText}
          disabled={disabled}
          aria-label="Add todo"
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 bg-accent text-white"
        >
          Add
        </button>
      )}
    </div>
  );
}
