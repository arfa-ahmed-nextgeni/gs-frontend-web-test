"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { NotifyMeDialog } from "@/components/dialogs/notify-me-dialog";
import { MaintenanceErrorFallback } from "@/components/shared/maintenance-error-fallback";

type ErrorProps = {
  error: { digest?: string } & Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("errors.maintenance");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <NotifyMeDialog productName="">
      <MaintenanceErrorFallback
        description={t("description")}
        onRetry={reset}
        retryLabel={t("retry")}
        title={t("title")}
      />
    </NotifyMeDialog>
  );
}
