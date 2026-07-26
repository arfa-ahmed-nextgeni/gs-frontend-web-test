"use client";

import Image from "next/image";
import type { ImageLoaderProps, ImageProps } from "next/image";

import {
  contentfulImageLoader,
  normalizeContentfulSrc,
} from "@/lib/utils/contentful-image-loader";
import { isContentfulSrc, isSvgSrc } from "@/lib/utils/image";

type ContentfulImageProps = {
  maxWidth?: number;
} & Omit<ImageProps, "loader">;

export const ContentfulImage = ({
  alt,
  maxWidth,
  src,
  unoptimized,
  ...props
}: ContentfulImageProps) => {
  const normalizedSrc =
    typeof src === "string" ? normalizeContentfulSrc(src) : src;
  const isSvg = typeof normalizedSrc === "string" && isSvgSrc(normalizedSrc);
  const loader =
    !isSvg &&
    typeof normalizedSrc === "string" &&
    isContentfulSrc(normalizedSrc)
      ? (loaderProps: ImageLoaderProps) =>
          contentfulImageLoader({ ...loaderProps, maxWidth })
      : undefined;

  return (
    <Image
      {...props}
      alt={alt}
      loader={loader}
      src={normalizedSrc}
      unoptimized={isSvg || unoptimized}
    />
  );
};
