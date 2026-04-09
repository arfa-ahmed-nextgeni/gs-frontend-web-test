"use client";

import { useState } from "react";

import type { ImageProps } from "next/image";
import Image from "next/image";

import { productPlaceholder } from "@/assets/placeholders";

type ProductImageWithFallbackProps = Omit<ImageProps, "onError">;

export function ProductImageWithFallback({
  alt,
  src,
  ...imageProps
}: ProductImageWithFallbackProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const imageSrc = hasLoadError || !src ? productPlaceholder : src;

  return (
    <Image
      {...imageProps}
      alt={alt}
      onError={hasLoadError ? undefined : () => setHasLoadError(true)}
      src={imageSrc}
    />
  );
}
