"use client";

import * as React from "react";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "w-8.5 peer inline-flex h-5 shrink-0 items-center rounded-full border border-transparent outline-none transition-all",
        "data-[state=checked]:bg-btn-bg-teal data-[state=unchecked]:bg-bg-muted-light",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "bg-bg-default pointer-events-none block h-4 w-4 rounded-full shadow-none transition-transform",
          // LTR: moves right (normal)
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
          // RTL: visually same motion, but technically reversed direction
          "rtl:data-[state=checked]:-translate-x-4 rtl:data-[state=unchecked]:-translate-x-0.5"
        )}
        data-slot="switch-thumb"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
