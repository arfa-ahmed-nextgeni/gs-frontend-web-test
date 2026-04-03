"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import { AddPaymentCardForm } from "@/components/customer/cards/add-payment-card-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { cn } from "@/lib/utils";

export const AddPaymentCardDialog = () => {
  const t = useTranslations("CustomerCardsPage.addNewCardDialog");

  const isMobile = useIsMobile();
  const { hasVisualViewport, height: viewportHeight } = useVisualViewport();

  const [open, setOpen] = useState(false);

  const closeDialog = () => setOpen(false);

  useEffect(() => {
    if (!isMobile || !open || typeof window === "undefined") return;

    const updateDialogPosition = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (!dialogContent) return false;

      if (hasVisualViewport) {
        const windowHeight = window.innerHeight;
        const diff = windowHeight - viewportHeight;
        // Only apply offset if difference is significant (keyboard is visible)
        // Threshold of 100px to avoid small differences from browser UI
        const offset = diff > 100 ? diff : 0;
        dialogContent.style.bottom = `${offset}px`;
      } else {
        dialogContent.style.bottom = "0px";
      }

      return true;
    };

    if (updateDialogPosition()) {
      return;
    }

    const timeoutId = setTimeout(updateDialogPosition, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [hasVisualViewport, isMobile, open, viewportHeight]);

  useEffect(() => {
    if (!isMobile || !open || typeof window === "undefined") {
      return;
    }

    return () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (dialogContent) {
        dialogContent.style.bottom = "";
      }
    };
  }, [isMobile, open]);

  if (isMobile) {
    return (
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger className="bg-bg-default text-text-primary h-12 w-full rounded-xl text-center text-xl font-medium shadow-[0_1px_0_0_var(--color-bg-surface)]">
          {t("triggerTitle")}
        </DialogTrigger>
        <DialogContent
          className={cn(
            "translate-none max-w-auto bottom-0 left-0 top-auto w-full rounded-none p-0"
          )}
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
          <div className="flex flex-col overflow-y-auto">
            <DialogDescription className="text-text-tertiary mt-5 px-5 text-sm font-normal">
              {t("description")}
            </DialogDescription>
            <AddPaymentCardForm
              closeDialogAction={closeDialog}
              containerProps={{
                className: "px-5 pb-5",
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger className="bg-bg-default text-text-primary h-12 w-full rounded-xl text-center text-xl font-medium shadow-[0_1px_0_0_var(--color-bg-surface)]">
        {t("triggerTitle")}
      </DialogTrigger>
      <DialogContent className="w-100 max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="mt-7.5 gap-4">
          <DialogTitle className="text-text-primary text-4xl font-normal">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-text-tertiary text-sm font-normal">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <AddPaymentCardForm closeDialogAction={closeDialog} />
      </DialogContent>
    </Dialog>
  );
};
