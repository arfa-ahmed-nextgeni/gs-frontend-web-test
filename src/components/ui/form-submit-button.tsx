"use client";

import { ComponentProps } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export const FormSubmitButton = ({
  children,
  className,
  isSubmitting,
  ...props
}: { isSubmitting?: boolean } & ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className={cn(
        "transition-default bg-btn-bg-primary text-text-ghost h-12.5 rounded-xl text-xl font-medium",
        "hover:bg-btn-bg-slate",
        !isSubmitting && "disabled:bg-btn-bg-muted",
        { "bg-btn-bg-slate": isSubmitting },
        "focus:bg-btn-bg-primary focus:outline-none",
        className
      )}
      disabled={isSubmitting || props.disabled}
      type="submit"
    >
      {isSubmitting ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner label="Loading" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
