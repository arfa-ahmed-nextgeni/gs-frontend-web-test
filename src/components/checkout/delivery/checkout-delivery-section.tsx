"use client";

import { useTranslations } from "next-intl";

import { CheckoutDeliveryMethods } from "./delivery-methods/checkout-delivery-methods";
import { CheckoutGiftWrapping } from "./gift-wrapping/checkout-gift-wrapping";

import type { DeliveryMethod } from "./delivery-methods/types";

interface CheckoutDeliverySectionProps {
  deliveryMethods?: DeliveryMethod[];
  giftWrappingEnabled: boolean;
  hasReceivedResponse?: boolean;
  isLoadingDeliveryMethods?: boolean;
  isWaitingForMoreInfo?: boolean;
  onGiftWrappingToggle: (enabled: boolean) => void;
  onMethodChange: (method: string) => void;
  selectedMethod: string;
}

export function CheckoutDeliverySection({
  deliveryMethods,
  giftWrappingEnabled,
  hasReceivedResponse = false,
  isLoadingDeliveryMethods,
  isWaitingForMoreInfo,
  onGiftWrappingToggle,
  onMethodChange,
  selectedMethod,
}: CheckoutDeliverySectionProps) {
  const t = useTranslations("CheckoutPage");

  return (
    <>
      <h2
        className="text-text-primary flex items-center justify-between text-xl font-medium lg:text-[25px] lg:font-semibold"
        data-section="delivery-methods"
      >
        <span>{t("delivery.title")}</span>
        {isWaitingForMoreInfo && (
          <span className="font-gilroy ml-4 whitespace-nowrap pt-2 text-[15px] font-normal text-[#85878A]">
            {t("delivery.waitingForMoreInfo")}
          </span>
        )}
      </h2>

      <section
        className="shadow-xs mb-2.5 rounded-lg lg:mb-0"
        data-section="delivery-methods-section"
      >
        {isWaitingForMoreInfo ? (
          <section className="shadow-xs mb-2.5 rounded-lg bg-white lg:mb-0">
            <div className="flex items-start justify-between px-4 py-4">
              <div className="flex-1 space-y-3">
                {[0, 1].map((index) => (
                  <div
                    className="h-4 w-full rounded-full bg-[#F2F3F5]"
                    key={index}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            <CheckoutDeliveryMethods
              hasReceivedResponse={hasReceivedResponse}
              isLoading={isLoadingDeliveryMethods}
              methods={deliveryMethods}
              onMethodChange={onMethodChange}
              selectedMethod={selectedMethod}
            />
            <CheckoutGiftWrapping
              isEnabled={giftWrappingEnabled}
              onToggle={onGiftWrappingToggle}
            />
          </>
        )}
      </section>
    </>
  );
}
