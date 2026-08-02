"use client";

import { type CSSProperties, useState } from "react";

import type { ImageProps } from "next/image";

import ProductPlaceholder from "@/assets/images/product-placeholder.svg";
import { RemoteImage } from "@/components/shared/remote-image";
import { cn } from "@/lib/utils";
import { isNoSelectionProductImageUrl } from "@/lib/utils/image";

type ProductImageWithFallbackProps = {
  showFallbackForNoSelection?: boolean;
  src?: ImageProps["src"];
} & Omit<ImageProps, "onError" | "src">;

const PLACEHOLDER_STYLE: CSSProperties = {
  backgroundImage: `url(${ProductPlaceholder.src})`,
};

export function ProductImageWithFallback({
  showFallbackForNoSelection = false,
  ...props
}: ProductImageWithFallbackProps) {
  const isNoSelection = isNoSelectionImage(props.src);

  // Hide the invalid API image unless a sole gallery image needs a fallback.
  if (isNoSelection && !showFallbackForNoSelection) {
    return null;
  }

  return (
    <ProductImageWithFallbackInner
      key={getSrcKey(props.src)}
      {...props}
      src={isNoSelection ? undefined : props.src}
    />
  );
}

function getSrcKey(src: ImageProps["src"] | undefined): string {
  if (!src) return "placeholder";
  if (typeof src === "string") return src;
  if ("src" in src) return src.src;
  return src.default.src;
}

function isNoSelectionImage(src: ImageProps["src"] | undefined): boolean {
  return !!src && isNoSelectionProductImageUrl(getSrcKey(src));
}

function ProductImageWithFallbackInner({
  alt,
  className,
  fill,
  onLoad,
  src,
  unoptimized = true,
  ...imageProps
}: ProductImageWithFallbackProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc = hasLoadError || !src ? ProductPlaceholder : src;
  const isPlaceholder = imageSrc === ProductPlaceholder;
  const showOverlay = !isLoaded && !isPlaceholder;

  return (
    <span className={cn("relative", fill ? "block size-full" : "inline-block")}>
      {showOverlay && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={PLACEHOLDER_STYLE}
        />
      )}
      <RemoteImage
        {...imageProps}
        alt={alt}
        className={cn(
          "transition-default",
          showOverlay && "opacity-0",
          className,
        )}
        fill={fill}
        onError={hasLoadError ? undefined : () => setHasLoadError(true)}
        onLoad={(event) => {
          onLoad?.(event);
          setIsLoaded(true);
        }}
        src={imageSrc}
        unoptimized={isPlaceholder ? false : unoptimized}
      />
    </span>
  );
}
