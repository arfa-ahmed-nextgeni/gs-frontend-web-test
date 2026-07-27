"use client";

import { type ComponentProps, type PropsWithChildren } from "react";

import { createNavigation } from "next-intl/navigation";

import { useBootTrigger } from "@/hooks/use-boot-trigger";
import { routing } from "@/i18n/routing";
import { INTERACTION_BOOT_POLICY } from "@/lib/boot/config/boot-presets";
import { LINK_PREFETCH_DISABLED } from "@/lib/config/client-env";

const { Link: BaseLink } = createNavigation(routing);

export const InteractionPrefetchLink = ({
  children,
  prefetch,
  ...props
}: PropsWithChildren<ComponentProps<typeof BaseLink>>) => {
  const hasInteractionBooted = useBootTrigger(
    !LINK_PREFETCH_DISABLED,
    INTERACTION_BOOT_POLICY,
  );
  const resolvedPrefetch =
    LINK_PREFETCH_DISABLED || !hasInteractionBooted
      ? false
      : prefetch === undefined
        ? "auto"
        : prefetch;

  return (
    <BaseLink {...props} prefetch={resolvedPrefetch}>
      {children}
    </BaseLink>
  );
};
