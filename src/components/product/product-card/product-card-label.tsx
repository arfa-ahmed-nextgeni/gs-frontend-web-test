import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export const ProductCardLabel = ({
  children,
  className,
  ...props
}: PropsWithChildren<React.ComponentProps<"div">>) => {
  return (
    <div
      className={cn(
        "h-6.25 text-text-primary flex flex-shrink-0 items-center justify-center rounded-xl px-2.5 text-[11px] font-medium leading-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
