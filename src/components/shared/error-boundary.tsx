"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { MaintenanceErrorFallback } from "@/components/shared/maintenance-error-fallback";
import { useRouter } from "@/i18n/navigation";

type ErrorBoundaryProps = {
  error: { digest?: string } & Error;
  holdMs?: number;
  loadingFallback?: ReactNode;
  reset: () => void;
};

const DEFAULT_HOLD_MS = 1000;

export function ErrorBoundary({
  error,
  holdMs = DEFAULT_HOLD_MS,
  loadingFallback,
  reset,
}: ErrorBoundaryProps) {
  const router = useRouter();
  const t = useTranslations("errors.maintenance");
  const [isHolding, setIsHolding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    if (!loadingFallback) {
      startTransition(() => {
        router.refresh();
        reset();
      });
      return;
    }

    setIsHolding(true);
    router.refresh();
  };

  useEffect(() => {
    if (!isHolding) return;

    const timer = setTimeout(() => {
      setIsHolding(false);
      startTransition(reset);
    }, holdMs);

    return () => clearTimeout(timer);
  }, [isHolding, holdMs, reset]);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const showSkeleton = (isHolding || isPending) && loadingFallback;

  if (showSkeleton) return <>{loadingFallback}</>;

  return (
    <MaintenanceErrorFallback
      description={t("description")}
      isRetrying={isPending}
      onRetry={handleRetry}
      retryingLabel={t("retrying")}
      retryLabel={t("retry")}
      title={t("title")}
    />
  );
}
