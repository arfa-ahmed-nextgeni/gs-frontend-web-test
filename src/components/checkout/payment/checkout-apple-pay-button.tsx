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

  // Apple Pay is available — the Pay button itself is rendered elsewhere,
  // so no status message is needed here.
  return null;
}
