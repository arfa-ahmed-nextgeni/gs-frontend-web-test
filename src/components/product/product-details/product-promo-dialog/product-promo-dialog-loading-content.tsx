"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type ProductPromoDialogLoadingContentProps = {
  title: string;
};

export function ProductPromoDialogLoadingContent({
  title,
}: ProductPromoDialogLoadingContentProps) {
  return (
    <DialogContent
      aria-describedby={undefined}
      className="h-[90dvh] w-[90dvw] overflow-y-auto p-0 lg:w-[60dvw]"
    >
      <VisuallyHidden>
        <DialogTitle>{title}</DialogTitle>
      </VisuallyHidden>
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="size-12.5" size={50} variant="dark" />
      </div>
    </DialogContent>
  );
}
