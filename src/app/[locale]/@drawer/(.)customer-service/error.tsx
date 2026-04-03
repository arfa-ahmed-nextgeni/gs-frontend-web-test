"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";

import { CustomerServiceOverlay } from "@/components/shared/customer-service/customer-service-overlay";
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
    <CustomerServiceOverlay>
      <MaintenanceErrorFallback
        description={t("description")}
        onRetry={reset}
        retryLabel={t("retry")}
        title={t("title")}
      />
    </CustomerServiceOverlay>
  );
}
