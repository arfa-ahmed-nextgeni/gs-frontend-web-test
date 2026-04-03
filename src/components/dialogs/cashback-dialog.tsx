"use client";

import { PropsWithChildren } from "react";

import Image from "next/image";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";

export function CashbackDialog({ children }: PropsWithChildren) {
  const { language } = useLocaleInfo();

  const imageUrl =
    language === "ar"
      ? "https://gs-euw1-magento-assets-prod.s3.eu-west-1.amazonaws.com/static/cashback-tag/Talon-loyalty-ar.png"
      : "https://gs-euw1-magento-assets-prod.s3.eu-west-1.amazonaws.com/static/cashback-tag/Talon-loyalty-en.png";

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-auto sm:max-w-auto h-[90dvh] w-[90dvw] overflow-hidden border-none p-0 lg:w-[50dvw]"
      >
        <VisuallyHidden>
          <DialogTitle>Cashback</DialogTitle>
        </VisuallyHidden>
        <ScrollArea className="h-[90dvh]" type="hover">
          <Image
            alt="cashback details"
            className="w-full"
            height={500}
            src={imageUrl}
            unoptimized
            width={500}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
