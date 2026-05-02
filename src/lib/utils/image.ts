import type { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

import { CONTENTFUL_IMAGE_HOST } from "@/lib/constants/contentful";

const SHIMMER_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2YzZjMiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2YzZjNmMzsjZDlkOWQ5OyNmM2YzZjMiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9yZWN0Pjwvc3ZnPg==" as PlaceholderValue;

export function getShimmerPlaceholder() {
  return SHIMMER_PLACEHOLDER;
}

export function isContentfulSrc(src: string) {
  try {
    return new URL(src).host === CONTENTFUL_IMAGE_HOST;
  } catch {
    return false;
  }
}
