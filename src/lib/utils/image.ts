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

export function isSvgSrc(src: string) {
  try {
    return new URL(src).pathname.toLowerCase().endsWith(".svg");
  } catch {
    return src.split("?", 1)[0].toLowerCase().endsWith(".svg");
  }
}

const PLACEHOLDER_IMAGE_PATH = "/placeholder/";

export function resolveProductImageUrl(
  variantUrl?: null | string,
  parentUrl?: null | string
): string {
  if (variantUrl && !isPlaceholderImageUrl(variantUrl)) {
    return variantUrl;
  }
  if (parentUrl && !isPlaceholderImageUrl(parentUrl)) {
    return parentUrl;
  }
  return "";
}

function isPlaceholderImageUrl(url?: null | string): boolean {
  return !!url && url.includes(PLACEHOLDER_IMAGE_PATH);
}
