import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const SaudiRiyalIcon = ({
  className,
  ...props
}: ComponentProps<"span">) => {
  return (
    <span {...props} className={cn("font-saudi-riyal", className)}>
      &#xE900;
    </span>
  );
};
