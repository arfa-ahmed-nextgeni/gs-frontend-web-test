"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CashbackDialog({
  children,
  dialogContent,
  title,
}: PropsWithChildren<{
  dialogContent?: ReactNode;
  title?: ReactNode;
}>) {
  if (!dialogContent) {
    return children;
  }

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-auto sm:max-w-auto h-[90dvh] w-[90dvw] overflow-hidden border-none p-0 lg:w-[50dvw]"
      >
        <VisuallyHidden>
          <DialogTitle>{title || "Cashback"}</DialogTitle>
        </VisuallyHidden>
        <ScrollArea className="h-[90dvh]" type="hover">
          {dialogContent}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
