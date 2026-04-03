"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import RocketIcon from "@/assets/icons/Rocket.svg";
import TruckIcon from "@/assets/icons/Truck.svg";
import { CheckoutBulletDeliveryMonitor } from "@/components/checkout/bullet-delivery/checkout-bullet-delivery-monitor";
import { CheckoutBulletDeliveryOption } from "@/components/checkout/bullet-delivery/checkout-bullet-delivery-option";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { LockerType } from "@/lib/constants/checkout/locker-locations";

import { CheckoutDeliveryOption } from "./checkout-delivery-option";
import { DeliveryMethod } from "./types";

interface CheckoutDeliveryMethodsProps {
  hasReceivedResponse?: boolean;
  isLoading?: boolean;
  methods?: DeliveryMethod[];
  onMethodChange: (method: string) => void;
  selectedMethod: string;
}

export function CheckoutDeliveryMethods({
  hasReceivedResponse = false,
  isLoading,
  methods,
  onMethodChange,
  selectedMethod,
}: CheckoutDeliveryMethodsProps) {
  const t = useTranslations("CheckoutPage");
  const { selectedLockerAddressType } = useCheckoutContext();
  const translate = (key: string, fallback: string) =>
    (t as any).has?.(key) ? t(key as any) : fallback;

  const deliveryMethods: DeliveryMethod[] = useMemo(
    () => [
      {
        estimatedTime: t("delivery.days", { days: "2–4" }),
        icon: TruckIcon,
        iconAlt: "truck",
        id: "lambdashipping_flatrate-lambdashipping_flatrate",
        name: t("delivery.standardDelivery"),
        price: "free",
      },
    ],
    [t]
  );

  const renderIcon = (method: DeliveryMethod) => {
    const id = method.id?.toLowerCase?.() ?? "";
    if (id.includes("express")) return method.icon ?? RocketIcon;
    if (id.includes("flatrate") || id.includes("flat_rate"))
      return method.icon ?? TruckIcon;

    return method.icon ?? TruckIcon;
  };

  const renderIconAlt = (method: DeliveryMethod) => {
    const id = method.id?.toLowerCase?.() ?? "";
    if (id.includes("express")) return "express";
    if (id.includes("flatrate") || id.includes("flat_rate")) return "truck";

    return method.iconAlt ?? "delivery";
  };

  const renderPrice = (price: "free" | number, currency?: string) => {
    if (price === "free") {
      return <span>{t("delivery.free")}</span>;
    }

    if (currency) {
      try {
        const formatted = new Intl.NumberFormat(undefined, {
          currency,
          style: "currency",
        }).format(price);
        return <LocalizedPrice price={formatted} />;
      } catch {
        return <LocalizedPrice price={`${currency} ${price.toFixed(2)}`} />;
      }
    }

    return <LocalizedPrice price={price.toFixed(2)} />;
  };

  const useFallback = typeof methods === "undefined";
  const methodsToRender = (useFallback ? deliveryMethods : methods)?.filter(
    (method) => {
      const id = method?.id?.toLowerCase();
      if (!id) return true;

      // If a locker address type is selected, show only the matching locker method
      if (selectedLockerAddressType) {
        if (selectedLockerAddressType === LockerType.Redbox) {
          return id.includes("redbox");
        }
        if (selectedLockerAddressType === LockerType.Fodel) {
          return id.includes("fodel");
        }
      }

      // Otherwise, hide all locker methods
      return !id.includes("fodel") && !id.includes("redbox");
    }
  );

  return (
    <div
      className="divide-y divide-[var(--divider)] bg-white [--divider:rgba(0,0,0,0.08)]"
      data-section="delivery-methods-list"
    >
      {/* Monitor component for bullet delivery state transitions */}
      <CheckoutBulletDeliveryMonitor
        isLoading={isLoading}
        methods={methodsToRender ?? []}
        onMethodChange={onMethodChange}
        selectedMethod={selectedMethod}
      />

      {isLoading && (
        <div className="divide-y divide-[var(--divider)] [--divider:rgba(0,0,0,0.08)]">
          {[1, 2].map((index) => (
            <div
              className="flex h-[45px] items-center justify-between px-4 py-3"
              key={`skeleton-${index}`}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <div className="flex flex-row items-center gap-4">
                  <Skeleton className="h-[15px] w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-[15px] w-12" />
                <Skeleton className="size-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading &&
        (methodsToRender ?? []).map((method) => {
          // Check if this is bullet/express delivery
          const isBulletDelivery =
            method.id?.toLowerCase().includes("express") ||
            method.carrier_code?.toLowerCase().includes("express");

          // If bullet delivery, use special component with eligibility checks
          if (isBulletDelivery) {
            return (
              <CheckoutBulletDeliveryOption
                estimatedTime={method.estimatedTime}
                icon={renderIcon(method)}
                iconAlt={renderIconAlt(method)}
                key={method.id}
                method={method}
                onMethodChange={onMethodChange}
                price={renderPrice(method.price, method.currency)}
                selectedMethod={selectedMethod}
              />
            );
          }

          // Otherwise, use standard delivery option
          return (
            <CheckoutDeliveryOption
              carrierTitle={method.carrier_title ?? method.name}
              estimatedTime={method.estimatedTime}
              icon={renderIcon(method)}
              iconAlt={renderIconAlt(method)}
              isSelected={selectedMethod === method.id}
              key={method.id}
              name={method.name}
              onChange={() => onMethodChange(method.id)}
              price={renderPrice(method.price, method.currency)}
              value={method.id}
            />
          );
        })}

      {!isLoading &&
        hasReceivedResponse &&
        !useFallback &&
        Array.isArray(methods) &&
        methods.length === 0 && (
          <div className="px-5 py-4 text-sm text-[#6B7280]">
            {translate(
              "delivery.noShippingMethods",
              "No shipping methods are available for the selected address."
            )}
          </div>
        )}
    </div>
  );
}
