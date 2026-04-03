import {
  type ComponentProps,
  createElement,
  type PropsWithChildren,
} from "react";

import { createNavigation } from "next-intl/navigation";

import { LinkPendingSignal } from "@/components/ui/link-pending-signal";
import { routing } from "@/i18n/routing";

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
const {
  getPathname,
  Link: BaseLink,
  redirect,
  usePathname,
  useRouter,
} = createNavigation(routing);

export const Link = ({
  children,
  prefetch = false,
  ...props
}: PropsWithChildren<ComponentProps<typeof BaseLink>>) => {
  return createElement(
    BaseLink,
    { ...props, prefetch },
    children,
    createElement(LinkPendingSignal)
  );
};

export { getPathname, redirect, usePathname, useRouter };
