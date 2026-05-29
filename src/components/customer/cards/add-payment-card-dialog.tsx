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
import { cn } from "@/lib/utils";

export const AddPaymentCardDialog = () => {
  const t = useTranslations("CustomerCardsPage.addNewCardDialog");

  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);

  const closeDialog = () => setOpen(false);

  useEffect(() => {
    if (!isMobile || !open || typeof window === "undefined") return;

    const updateDialogPosition = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (!dialogContent) return;

      const vv = window.visualViewport;
      if (vv) {
        const windowHeight = window.innerHeight;
        const diff = windowHeight - vv.height;

        if (diff > 100) {
          dialogContent.style.bottom = `${windowHeight - vv.height - vv.offsetTop}px`;
          dialogContent.style.maxHeight = `${vv.height}px`;
          dialogContent.style.height = `${vv.height}px`;
        } else {
          dialogContent.style.bottom = "0px";
          dialogContent.style.maxHeight = "";
          dialogContent.style.height = "";
        }
      } else {
        dialogContent.style.bottom = "0px";
        dialogContent.style.maxHeight = "";
        dialogContent.style.height = "";
      }
    };

    updateDialogPosition();
    const initialTimeout = setTimeout(updateDialogPosition, 0);

    window.visualViewport?.addEventListener("resize", updateDialogPosition);
    window.visualViewport?.addEventListener("scroll", updateDialogPosition);

    return () => {
      clearTimeout(initialTimeout);
      window.visualViewport?.removeEventListener(
        "resize",
        updateDialogPosition
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        updateDialogPosition
      );

      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (dialogContent) {
        dialogContent.style.bottom = "";
        dialogContent.style.maxHeight = "";
        dialogContent.style.height = "";
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
            "translate-none max-w-auto bottom-0 left-0 top-auto w-full rounded-none p-0",
            "flex max-h-[90dvh] flex-col overflow-hidden"
          )}
          showCloseButton={false}
        >
          <DialogHeader className="py-3.75 border-border-base flex shrink-0 flex-row justify-between border-b px-5">
            <DialogTitle className="text-text-primary text-xl font-medium">
              {t("title")}
            </DialogTitle>
            <DialogClose>
              <Image alt="close" className="size-5" src={CloseIcon} />
            </DialogClose>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
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
