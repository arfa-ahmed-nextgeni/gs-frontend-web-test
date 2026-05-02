"use client";

import { createContext, PropsWithChildren, useContext, useRef } from "react";

import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import { isMobileViewport } from "@/lib/utils/responsive";

const NotifyMeDialogContext = createContext<{
  closeDialog: () => void;
} | null>(null);

export const useNotifyMeDialog = () => {
  const context = useContext(NotifyMeDialogContext);
  if (!context) {
    throw new Error(
      "useNotifyMeDialog must be used within NotifyMeDialog component"
    );
  }
  return context;
};

export function NotifyMeDialog({
  children,
  productName,
}: PropsWithChildren<{
  productName: string;
}>) {
  const router = useRouter();
  const t = useTranslations("NotifyMeDialog");
  const titleRef = useRef<HTMLHeadingElement>(null);

  const closeDialog = () => {
    router.back();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  const handleOpenAutoFocus = (event: Event) => {
    if (!isMobileViewport()) {
      return;
    }

    event.preventDefault();
    titleRef.current?.focus({ preventScroll: true });
  };

  return (
    <NotifyMeDialogContext.Provider value={{ closeDialog }}>
      <Dialog onOpenChange={handleOpenChange} open>
        <DialogContent
          aria-describedby={undefined}
          className="w-100 bg-bg-body max-h-[90dvh] overflow-y-auto"
          onOpenAutoFocus={handleOpenAutoFocus}
        >
          <DialogHeader className="mt-7 gap-4">
            <DialogTitle
              className="text-text-primary text-4xl font-normal"
              ref={titleRef}
              tabIndex={-1}
            >
              {t("title")}
            </DialogTitle>
            {productName ? (
              <DialogDescription className="text-text-tertiary text-sm font-normal">
                {t.rich("description", {
                  productName: () => (
                    <span className="underline">{productName}</span>
                  ),
                })}
              </DialogDescription>
            ) : (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </NotifyMeDialogContext.Provider>
  );
}
