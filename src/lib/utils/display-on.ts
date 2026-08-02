import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";

export const CONTENT_VIEWPORTS = ["mobile", "desktop"] as const;

export type ContentViewport = (typeof CONTENT_VIEWPORTS)[number];

const displayOnClassNames = {
  block: {
    all: "",
    desktop: "hidden lg:block",
    mobile: "lg:hidden",
  },
  flex: {
    all: "",
    desktop: "hidden lg:flex",
    mobile: "lg:hidden",
  },
} satisfies Record<"block" | "flex", Record<ContentDisplayOn, string>>;

export function getDisplayOnClassName(
  displayOn: ContentDisplayOn = "all",
  display: "block" | "flex" = "block",
) {
  return displayOnClassNames[display][displayOn];
}

export const isVisibleOnViewport = (
  displayOn: ContentDisplayOn = "all",
  viewport: ContentViewport,
) => displayOn === "all" || displayOn === viewport;
