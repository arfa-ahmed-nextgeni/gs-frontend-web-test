"use client";

import { useState } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type ProductPromoDialogContentProps = {
  iframeUrl: string;
  title: string;
};

export function ProductPromoDialogContent({
  iframeUrl,
  title,
}: ProductPromoDialogContentProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <DialogContent
      aria-describedby={undefined}
      className="h-[90dvh] w-[90dvw] overflow-y-auto p-0 lg:w-[60dvw]"
    >
      <VisuallyHidden>
        <DialogTitle>{title}</DialogTitle>
      </VisuallyHidden>
      {isLoading && (
        <div className="absolute flex h-full w-full items-center justify-center">
          <Spinner className="size-12.5" size={50} variant="dark" />
        </div>
      )}
      <iframe
        className="h-full w-full border-0"
        loading="eager"
        onError={() => setIsLoading(false)}
        onLoad={() => setIsLoading(false)}
        src={iframeUrl}
      />
    </DialogContent>
  );
}
