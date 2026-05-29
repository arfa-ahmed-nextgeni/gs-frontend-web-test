"use client";

import { type CSSProperties, useState } from "react";

import type { ImageProps } from "next/image";

import ProductPlaceholder from "@/assets/images/product-placeholder.svg";
import { RemoteImage } from "@/components/shared/remote-image";
import { cn } from "@/lib/utils";

type ProductImageWithFallbackProps = {
  src?: ImageProps["src"];
} & Omit<ImageProps, "onError" | "src">;

const PLACEHOLDER_STYLE: CSSProperties = {
  backgroundImage: `url(${ProductPlaceholder.src})`,
};

export function ProductImageWithFallback(props: ProductImageWithFallbackProps) {
  return (
    <ProductImageWithFallbackInner key={getSrcKey(props.src)} {...props} />
  );
}

function getSrcKey(src: ImageProps["src"] | undefined): string {
  if (!src) return "placeholder";
  if (typeof src === "string") return src;
  if ("src" in src) return src.src;
  return src.default.src;
}

function ProductImageWithFallbackInner({
  alt,
  className,
  fill,
  onLoad,
  src,
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
          className
        )}
        fill={fill}
        onError={hasLoadError ? undefined : () => setHasLoadError(true)}
        onLoad={(event) => {
          onLoad?.(event);
          setIsLoaded(true);
        }}
        src={imageSrc}
        unoptimized={isPlaceholder ? false : true}
      />
    </span>
  );
}
