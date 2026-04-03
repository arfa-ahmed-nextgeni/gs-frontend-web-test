"use client";

import { PropsWithChildren } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";

export const OriginalProductDialog = ({ children }: PropsWithChildren) => {
  const t = useTranslations("ProductPage.originalProductsDialog");

  const { language } = useLocaleInfo();

  const videoUrl =
    language === "ar"
      ? "https://gs-euw1-public-data-prod.s3-eu-west-1.amazonaws.com/general/original_video/ar.mp4"
      : "https://gs-euw1-public-data-prod.s3-eu-west-1.amazonaws.com/general/original_video/en.mp4";

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
            {t("title")}
          </DialogTitle>
          <DialogClose>
            <Image alt="close" className="size-5" src={CloseIcon} />
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-5">
          <p className="text-text-primary text-xl font-medium">
            {t("heading")}
          </p>
          <p className="text-text-primary text-sm font-normal">
            {t("description")}
          </p>
          <div className="relative aspect-video w-full">
            <iframe
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
              src={videoUrl}
              title="Product video"
            />
          </div>
          <p className="text-text-primary text-xl font-medium">
            {t("whyChooseTitle")}
          </p>
          <p className="text-text-primary text-sm font-normal">
            {t("whyChooseDescription1")}
          </p>
          <p className="text-text-primary text-sm font-normal">
            {t("whyChooseDescription2")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
