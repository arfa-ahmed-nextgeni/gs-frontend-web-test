"use client";

import { useMemo } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useThrottledNow } from "@/hooks/use-throttled-now";
import { getBulletCountdownDataByCity } from "@/lib/utils/bullet-delivery/countdown";
import { isBulletDeliveryVisible } from "@/lib/utils/bullet-delivery/eligibility";

import type { DeliveryMethod } from "../delivery/delivery-methods/types";

interface CheckoutBulletDeliveryOptionProps {
  estimatedTime?: string;
  icon: string;
  iconAlt: string;
  method: DeliveryMethod;
  onMethodChange: (methodId: string) => void;
  price: React.ReactNode;
  selectedMethod: string;
}

/**
 * Bullet delivery option component with real-time eligibility checks
 * Returns null if not eligible, otherwise renders the delivery option
 */
export function CheckoutBulletDeliveryOption({
  estimatedTime,
  icon,
  iconAlt,
  method,
  onMethodChange,
  price,
  selectedMethod,
}: CheckoutBulletDeliveryOptionProps) {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const now = useThrottledNow(1000);
  const isMobile = useIsMobile();
  const t = useTranslations("CheckoutPage.bulletDelivery");

  // Perform all eligibility checks (skip cutOffTime check, use city time window instead)
  const isVisible = useMemo(
    () =>
      isBulletDeliveryVisible(cart, storeConfig, now, {
        skipCutoffTimeCheck: true,
      }),
    [cart, storeConfig, now]
  );

  // Get countdown data based on city-specific time window (only if visible)
  const countdownData = useMemo(() => {
    if (!isVisible) {
      return null;
    }
    return getBulletCountdownDataByCity(
      cart?.shippingAddress?.city,
      storeConfig?.bulletDeliveryConfig,
      now
    );
  }, [
    isVisible,
    cart?.shippingAddress?.city,
    storeConfig?.bulletDeliveryConfig,
    now,
  ]);

  // Build the countdown message if available (placed after delivery time)
  const remainingTimeMessage = useMemo(() => {
    if (!isVisible || !countdownData || countdownData.remainingMs <= 0) {
      return null;
    }

    const { hours = 0, minutes = 0 } = countdownData;

    // Use shorter format for mobile to fit on single line
    if (isMobile) {
      const timeParts = [];
      if (hours > 0) {
        timeParts.push(`${hours}h`);
      }
      if (minutes > 0) {
        timeParts.push(`${minutes}m`);
      }
      const shortTime = timeParts.join(" ");
      return t("orderInShort", { time: shortTime });
    }

    // Desktop: use full format with translations
    const remainingTime = `${hours > 0 ? `${hours} ${t("hours", { count: hours })} ` : ""}${minutes} ${t("minutes", { count: minutes })}`;
    return t("orderWithin", { remainingTime });
  }, [isVisible, countdownData, t, isMobile]);

  // If not eligible, don't render
  if (!isVisible) {
    return null;
  }

  // Remove "Delivery in", "Estimated Delivery" (EN) and "التوصيل خلال" (AR) prefixes from estimated time (mobile only)
  const cleanedEstimatedTime =
    isMobile && estimatedTime
      ? estimatedTime
          .replace(/^(Estimated Delivery|Delivery in|التوصيل خلال):?\s*/i, "")
          .trim()
      : estimatedTime;

  const displayName = method.carrier_title ?? method.name ?? "";

  // Render using the same component as standard delivery
  return (
    <label className="flex h-[45px] cursor-pointer items-center justify-between rounded-[10px] px-4 py-3">
      <div className="flex items-center gap-2 lg:gap-3">
        <span className="bg-bg-default inline-flex size-6 items-center justify-center rounded-full">
          <Image alt={iconAlt} className="h-5 w-5" src={icon} />
        </span>
        <div className="flex flex-row items-center gap-1 lg:gap-4">
          <span className="text-text-primary text-[15px] font-medium">
            {displayName}
          </span>
          {cleanedEstimatedTime && (
            <span className="text-[10px] text-[#FE5000] lg:text-xs">
              {cleanedEstimatedTime}
              {remainingTimeMessage && ` (${remainingTimeMessage})`}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center text-[15px] font-medium text-[#00C7B1]">
          {price}
        </span>
        <input
          checked={selectedMethod === method.id}
          className="sr-only"
          name="delivery"
          onChange={(e) => {
            if (e.target.checked) {
              onMethodChange(method.id);
            }
          }}
          type="radio"
          value={method.id}
        />
        <span
          className={`relative inline-flex size-5 items-center justify-center rounded-full ${
            selectedMethod === method.id
              ? "border-[1.5px] border-[#5D5D5D]"
              : "border border-[#5D5D5D]"
          }`}
        >
          {selectedMethod === method.id && (
            <>
              <span className="absolute size-3.5 rounded-full border-[1.5px] border-[#E5E7EB] bg-white" />
              <span className="absolute size-3 rounded-full bg-[#6543F5]" />
            </>
          )}
        </span>
      </div>
    </label>
  );
}
