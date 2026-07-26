"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Spinner } from "@/components/ui/spinner";

export function ApiActivityEntrySubmitButton({
  children,
  isSelected,
}: {
  children: ReactNode;
  isSelected: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      aria-current={isSelected ? "page" : undefined}
      className={`border-border-divider relative block w-full border-b px-6 py-4 text-left transition-colors last:border-b-0 disabled:cursor-wait ${
        isSelected ? "bg-bg-soft" : "hover:bg-bg-surface"
      }`}
      disabled={pending}
      type="submit"
    >
      <div className={pending ? "opacity-45" : undefined}>{children}</div>

      {pending ? (
        <span
          aria-live="polite"
          className="bg-bg-default text-text-primary absolute inset-x-4 bottom-3 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm"
        >
          <Spinner size={14} variant="dark" />
          Loading details...
        </span>
      ) : null}
    </button>
  );
}
