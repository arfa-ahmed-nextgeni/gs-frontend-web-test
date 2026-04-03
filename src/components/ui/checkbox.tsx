"use client";

import * as React from "react";

import Image from "next/image";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import CheckboxCheckIcon from "@/assets/icons/checkbox-check-icon.svg";
import { cn } from "@/lib/utils/index";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "border-input border-border-strong transition-default data-[state=checked]:bg-bg-brand data-[state=checked]:text-text-inverse focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive shadow-xs peer size-3 shrink-0 rounded-[4px] border outline-none transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-none",
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="flex items-center justify-center text-current transition-none"
        data-slot="checkbox-indicator"
      >
        <Image alt="check" className="size-full" src={CheckboxCheckIcon} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
