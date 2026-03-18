import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("pickRandom called with empty array");
  }
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Returns true when the primary input device is a mouse or trackpad,
 * indicating a desktop-class device where auto-focusing an input won't
 * trigger an on-screen keyboard.
 */
export function isDesktopDevice(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
