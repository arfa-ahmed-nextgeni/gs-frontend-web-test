"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

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
    <MaintenanceErrorFallback
      description={t("description")}
      onRetry={reset}
      retryLabel={t("retry")}
      title={t("title")}
    />
  );
}
