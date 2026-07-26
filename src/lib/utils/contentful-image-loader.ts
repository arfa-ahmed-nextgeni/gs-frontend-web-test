import type { ImageLoaderProps } from "next/image";

import { isContentfulSrc } from "@/lib/utils/image";

const DEFAULT_CONTENTFUL_MAX_WIDTH = 1200;
const DEFAULT_CONTENTFUL_QUALITY = 62;

export function contentfulImageLoader({
  maxWidth = DEFAULT_CONTENTFUL_MAX_WIDTH,
  quality,
  src,
  width,
}: { maxWidth?: number } & ImageLoaderProps) {
  const normalizedSrc = normalizeContentfulSrc(src);

  if (!isContentfulSrc(normalizedSrc)) return normalizedSrc;

  const url = new URL(normalizedSrc);
  url.searchParams.set("fm", "avif");
  url.searchParams.set("q", (quality || DEFAULT_CONTENTFUL_QUALITY).toString());
  url.searchParams.set("w", Math.min(width, maxWidth).toString());

  return url.toString();
}

export function normalizeContentfulSrc(src: string) {
  return src.startsWith("//") ? `https:${src}` : src;
}
