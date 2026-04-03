"use client";

import { type ReactNode } from "react";

import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/i18n/navigation";

export function CustomerServiceDialog({ children }: { children: ReactNode }) {
  const t = useTranslations("CustomerServiceActionSheet");
  const router = useRouter();

  const closeDialog = () => {
    router.back();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary text-xl font-medium">
            {t("title")}
          </DialogTitle>
        </DialogHeader>
        <div className="gap-7.5 flex flex-col pt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
