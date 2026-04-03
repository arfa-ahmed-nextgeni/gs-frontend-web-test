"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";

import {
  contentfulImageLoader,
  normalizeContentfulSrc,
} from "@/lib/utils/contentful-image-loader";
import { isContentfulSrc } from "@/lib/utils/image";

export const ContentfulImage = ({
  alt,
  src,
  ...props
}: Omit<ImageProps, "loader">) => {
  const normalizedSrc =
    typeof src === "string" ? normalizeContentfulSrc(src) : src;
  const loader =
    typeof normalizedSrc === "string" && isContentfulSrc(normalizedSrc)
      ? contentfulImageLoader
      : undefined;

  return <Image {...props} alt={alt} loader={loader} src={normalizedSrc} />;
};
