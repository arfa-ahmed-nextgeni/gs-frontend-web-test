"use client";

import { PropsWithChildren } from "react";

import Container from "@/components/shared/container";
import { useHeaderContext } from "@/layouts/header/header-container";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const DesktopNavigationContainer = ({
  children,
  isSticky,
  zIndexLevel,
}: PropsWithChildren<{
  isSticky?: boolean;
  zIndexLevel: ZIndexLevel;
}>) => {
  const { showDesktopNavigation } = useHeaderContext();

  return (
    <Container
      className={cn(
        "border-border-base transition-default bg-bg-default relative hidden border-b lg:block",
        zIndexLevel,
        `${isSticky ? (showDesktopNavigation ? "translate-y-0" : "-translate-y-full") : ""}`,
        {
          "absolute w-full": isSticky,
        }
      )}
      variant="FullWidth"
    >
      <Container className={zIndexLevel}>{children}</Container>
    </Container>
  );
};
