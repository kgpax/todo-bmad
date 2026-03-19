import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  "aria-label": string;
  pending?: boolean;
}

export function Checkbox({ checked, onCheckedChange, "aria-label": ariaLabel, pending }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      aria-label={ariaLabel}
      disabled={pending}
      className={[
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-checkbox)] border-2 outline-none",
        "transition-[background-color,border-color,opacity] duration-[var(--duration-fast)] ease-out",
        "focus-visible:ring-0",
        checked
          ? "border-accent bg-accent"
          : "border-text-placeholder bg-transparent",
        pending ? "opacity-50 cursor-not-allowed animate-pulse" : "cursor-pointer",
      ].join(" ")}
    >
      <CheckboxPrimitive.Indicator
        forceMount
        className="flex items-center justify-center transition-transform duration-[var(--duration-fast)] ease-out data-[state=checked]:scale-100 data-[state=unchecked]:scale-0"
      >
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
