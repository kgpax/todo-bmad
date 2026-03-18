"use client";

import { useState, useEffect, useRef } from "react";
import { pickRandom } from "@/lib/utils";
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

  useEffect(() => {
    setPlaceholder(pickRandom(getPlaceholderBank(placeholderContext)));
  }, [placeholderContext]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const trimmed = text.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setText("");
      }
    } else if (e.key === "Escape") {
      setText("");
      inputRef.current?.blur();
    }
  }

  function handleSubmitClick() {
    const trimmed = text.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setText("");
    }
  }

  const shadowStyle = focused
    ? { boxShadow: `0 0 0 3px var(--color-accent), var(--shadow-hover)` }
    : { boxShadow: "var(--shadow-resting)" };

  return (
    <div
      className="bg-surface rounded-xl p-4 md:p-5 flex items-center gap-3 transition-shadow"
      style={shadowStyle}
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
          onClick={handleSubmitClick}
          disabled={disabled}
          aria-label="Add todo"
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
        >
          Add
        </button>
      )}
    </div>
  );
}
