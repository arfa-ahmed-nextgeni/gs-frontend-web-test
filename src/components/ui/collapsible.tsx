"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

function Collapsible({
  alwaysOpenOnDesktop,
  ...props
}: { alwaysOpenOnDesktop?: boolean } & React.ComponentProps<
  typeof CollapsiblePrimitive.Root
>) {
  const isMobile = useIsMobile();

  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      {...props}
      defaultOpen={!isMobile && alwaysOpenOnDesktop ? true : props.defaultOpen}
      open={!isMobile && alwaysOpenOnDesktop ? true : props.open}
    />
  );
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      className={cn(
        "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      data-slot="collapsible-content"
      {...props}
    />
  );
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
