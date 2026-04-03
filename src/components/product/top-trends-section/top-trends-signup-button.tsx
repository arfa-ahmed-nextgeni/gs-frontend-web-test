"use client";

import { withVisibilityLoad } from "@/components/hoc/with-visibility-load";
import { cn } from "@/lib/utils";

export const TopTrendsSignupButton = withVisibilityLoad<{
  className?: string;
  title: string;
}>({
  displayName: "TopTrendsSignupButton",
  loader: () =>
    import("@/components/product/signup-now-button").then((module) => ({
      default: module.SignupNowButton,
    })),
  renderFallback: ({ props, sentinelRef }) => (
    <span
      aria-hidden
      className={cn(props.className, "invisible")}
      ref={sentinelRef}
    >
      {props.title}
    </span>
  ),
  rootMargin: "160px 0px",
});
