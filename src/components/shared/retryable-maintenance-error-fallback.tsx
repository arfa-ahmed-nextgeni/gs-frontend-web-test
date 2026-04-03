"use client";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";

import { MaintenanceErrorFallback } from "./maintenance-error-fallback";

export function RetryableMaintenanceErrorFallback() {
  const router = useRouter();
  const t = useTranslations("errors.maintenance");
  const tGeneral = useTranslations("errors.general");

  return (
    <MaintenanceErrorFallback
      description={t("description")}
      homeHref="/"
      homeLabel={tGeneral("goHome")}
      onRetry={() => router.refresh()}
      reloadLabel={tGeneral("reload")}
      retryLabel={t("retry")}
      title={t("title")}
    />
  );
}
