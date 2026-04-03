"use client";

import { useTranslations } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { useBulletDeliveryMonitor } from "@/hooks/checkout/use-bullet-delivery-monitor";

import type { DeliveryMethod } from "../delivery/delivery-methods/types";

interface CheckoutBulletDeliveryMonitorProps {
  isLoading?: boolean;
  methods: DeliveryMethod[];
  onMethodChange: (methodId: string) => void;
  selectedMethod: string;
}

/**
 * Monitors delivery methods array for bullet delivery presence
 * Handles state transitions: toast messages and auto-selection
 */
export function CheckoutBulletDeliveryMonitor({
  isLoading,
  methods,
  onMethodChange,
  selectedMethod,
}: CheckoutBulletDeliveryMonitorProps) {
  const t = useTranslations("CheckoutPage.bulletDelivery");

  // Handle eligible toast with action button
  const handleShowEligibleToast = (bulletMethod: DeliveryMethod) => {
    toast({
      actionButton: {
        onClick: () => {
          onMethodChange(bulletMethod.id);
        },
        title: t("clickToApply"),
      },
      description: "",
      duration: 5000,
      position: "top",
      title: t("qualifiedToast"),
      type: "bullet",
    });
  };

  // Handle ineligible toast
  const handleShowIneligibleToast = (
    messageKey: string,
    type: "info" | "warning" = "info"
  ) => {
    const message =
      messageKey === "standardApplied" ? t("standardApplied") : messageKey;

    toast({
      description: "",
      duration: 4000,
      position: "top",
      title: message,
      type,
    });
  };

  // Use the custom hook for monitoring logic
  useBulletDeliveryMonitor({
    isLoading,
    methods,
    onMethodChange,
    onShowEligibleToast: handleShowEligibleToast,
    onShowIneligibleToast: handleShowIneligibleToast,
    selectedMethod,
  });

  // This component doesn't render anything
  return null;
}
