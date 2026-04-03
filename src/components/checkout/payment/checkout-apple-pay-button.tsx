"use client";

import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { useApplePayContext } from "@/contexts/apple-pay-context";

export function CheckoutApplePayButton() {
  const t = useTranslations("CheckoutPage.applePay");
  const { isAvailable, isPending } = useApplePayContext();

  if (isPending) {
    return <Skeleton className="h-10 w-full rounded-xl" />;
  }

  // Show message if Apple Pay is not available
  if (!isAvailable) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">{t("notAvailable")}</p>
      </div>
    );
  }

  // Show ready message when Apple Pay is available
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex items-center justify-center gap-2">
        <span className="text-green-600">✓</span>
        <p className="text-sm font-medium text-green-800">{t("ready")}</p>
      </div>
    </div>
  );
}
