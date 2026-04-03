"use client";

import type { PropsWithChildren } from "react";

import Container from "@/components/shared/container";
import { useRouteMatch } from "@/hooks/use-route-match";
import { cn } from "@/lib/utils";

export function HeaderRowShell({ children }: PropsWithChildren) {
  const { isProductRoot } = useRouteMatch();

  return (
    <Container
      className={cn(
        "lg:h-(--desktop-header-height) flex flex-row items-center gap-5 lg:gap-7",
        isProductRoot
          ? "h-(--mobile-product-header-height)"
          : "h-(--mobile-header-height)"
      )}
    >
      {children}
    </Container>
  );
}
