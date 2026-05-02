"use client";

import { useState } from "react";

import type { ImageProps } from "next/image";

import { productPlaceholder } from "@/assets/placeholders";
import { RemoteImage } from "@/components/shared/remote-image";

type ProductImageWithFallbackProps = {
  src?: ImageProps["src"];
} & Omit<ImageProps, "onError" | "src">;

export function ProductImageWithFallback({
  alt,
  src,
  ...imageProps
}: ProductImageWithFallbackProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const imageSrc = hasLoadError || !src ? productPlaceholder : src;
  const isPlaceholder = imageSrc === productPlaceholder;

  return (
    <RemoteImage
      {...imageProps}
      alt={alt}
      onError={hasLoadError ? undefined : () => setHasLoadError(true)}
      src={imageSrc}
      unoptimized={isPlaceholder ? false : true}
    />
  );
}
