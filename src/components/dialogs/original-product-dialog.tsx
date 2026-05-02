"use client";

import type { PropsWithChildren, ReactNode } from "react";

import Image from "next/image";

import CloseIcon from "@/assets/icons/close-icon.svg";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const OriginalProductDialog = ({
  children,
  dialogContent,
  title,
}: PropsWithChildren<{
  dialogContent?: ReactNode;
  title?: ReactNode;
}>) => {
  if (!title || !dialogContent) {
    return children;
  }

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-auto sm:max-w-auto h-[90dvh] w-[90dvw] overflow-hidden border-none px-0 py-5 lg:w-[50dvw]"
        showCloseButton={false}
      >
        <DialogHeader className="py-3.75 border-border-base flex flex-row justify-between border-b px-5">
          <DialogTitle className="text-text-primary text-xl font-medium">
            {title}
          </DialogTitle>
          <DialogClose>
            <Image alt="close" className="size-5" src={CloseIcon} />
          </DialogClose>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
};
