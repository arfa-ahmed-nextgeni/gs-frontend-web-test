"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";

import { useTranslations } from "next-intl";

import CardsIcon from "@/assets/icons/cards-icon.svg";
import MoneyIcon from "@/assets/icons/Money.svg";
import TabbyIcon from "@/assets/icons/Tabby.svg";
import TamaraIcon from "@/assets/icons/Tamara.svg";
import ApplePayIcon from "@/assets/images/apple-pay.svg";
import { CheckoutPaymentTracker } from "@/components/analytics/checkout-payment-tracker";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { RadioGroup } from "@/components/ui/radio-group";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useTrackPaymentMethodSelection } from "@/hooks/analytics/use-track-payment-method-selection";
import {
  isApplePayPaymentMethod,
  isCheckoutComPaymentMethod,
  requiresCardPaymentSection,
} from "@/lib/utils/payment-method";
import { formatPrice } from "@/lib/utils/price";

import { CheckoutApplePayButton } from "./checkout-apple-pay-button";
import { CheckoutCardPaymentSection } from "./checkout-card-payment-section";
import { CheckoutCardPaymentSectionPayfort } from "./checkout-card-payment-section-payfort";
import { CheckoutPaymentOption } from "./checkout-payment-option";
import { PaymentDowntimeAlert } from "./payment-downtime-alert";
import { PaymentMethod } from "./types";

import type { PaymentCardData } from "@/components/checkout/checkout-page";

interface CheckoutPaymentMethodsProps {
  availablePaymentMethods?: Array<{
    code: string;
    downtime_alert?: null | string;
    title: string;
  }>;
  cardIdToRestore?: null | string;
  currencyCode: string;
  disableAutoSelect?: boolean;
  grandTotal: number;
  initialPaymentCards?: PaymentCardData[];
  isDeliverySelected?: boolean;
  isWaitingForMoreInfo?: boolean;
  onCardTokenReady: (
    token: string,
    card?: null | PaymentCardData,
    cardNumber?: string,
    cvv?: string
  ) => void;
  onMethodChange: (method: string) => void;
  selectedMethod: string;
  selectedPaymentCard?: null | PaymentCardData;
}

export function CheckoutPaymentMethods({
  availablePaymentMethods = [],
  cardIdToRestore = null,
  currencyCode,
  disableAutoSelect = false,
  grandTotal,
  initialPaymentCards = [],
  isDeliverySelected = false,
  isWaitingForMoreInfo = false,
  onCardTokenReady,
  onMethodChange,
  selectedMethod,
  selectedPaymentCard = null,
}: CheckoutPaymentMethodsProps) {
  const t = useTranslations("CheckoutPage");
  const { storeConfig } = useStoreConfig();
  const trackPaymentMethodSelection = useTrackPaymentMethodSelection();

  const tamaraInstallments = storeConfig?.tamaraInstallments?.installments || 4;
  const installmentAmount = grandTotal / tamaraInstallments;

  const tabbyDescription: null | ReactNode =
    grandTotal > 0
      ? (t.rich("payment.tabbyDescription", {
          amount: () => (
            <LocalizedPrice
              price={String(
                formatPrice({
                  amount: installmentAmount,
                  currencyCode,
                  options: {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  },
                })
              )}
            />
          ),
          b: (chunks: any) => <b>{chunks}</b>,
          count: String(tamaraInstallments),
        }) as unknown as ReactNode)
      : null;

  const tamaraDescription: null | ReactNode =
    grandTotal > 0
      ? (t.rich("payment.tamaraDescription", {
          amount: () => (
            <LocalizedPrice
              price={String(
                formatPrice({
                  amount: installmentAmount,
                  currencyCode,
                  options: {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  },
                })
              )}
            />
          ),
          b: (chunks: any) => <b>{chunks}</b>,
          count: String(tamaraInstallments),
        }) as unknown as ReactNode)
      : null;

  const paymentMethods = useMemo(() => {
    if (availablePaymentMethods.length === 0) {
      return [];
    }

    // Create payment methods dynamically from backend data
    const methods: PaymentMethod[] = availablePaymentMethods.map(
      (backendMethod) => {
        const code = backendMethod.code.toLowerCase();

        const isTabby = code === "tabby_installments" || code.includes("tabby");
        const isTamara =
          code === "pay_by_instalments" ||
          code.includes("tamara") ||
          code.includes("paybyinstalments");

        return {
          description: isTabby
            ? tabbyDescription
            : isTamara
              ? tamaraDescription
              : null,
          descriptionPrice: null,
          downtimeAlert: backendMethod.downtime_alert || null,
          icon: getPaymentMethodIcon(backendMethod.code),
          id: backendMethod.code, // Use backend code directly as ID
          isAvailable: true,
          name: backendMethod.title || backendMethod.code,
          originalCode: backendMethod.code,
        };
      }
    );

    return methods;
  }, [availablePaymentMethods, tabbyDescription, tamaraDescription]);

  const shouldShowSkeleton =
    isWaitingForMoreInfo || paymentMethods.length === 0;

  // Find the currently selected payment method to check if it's Payfort
  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.id === selectedMethod
  );
  const isPayfortSelected =
    selectedPaymentMethod &&
    isPayfortPaymentMethod(selectedPaymentMethod.originalCode || "");

  // Clear any selected card when Payfort is selected (user must add card every time)
  useEffect(() => {
    if (isPayfortSelected && selectedPaymentCard) {
      onCardTokenReady("", null, undefined, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPayfortSelected]); // Only clear when Payfort selection changes, not when card changes

  // Check if checkout.com payment method is available
  const checkoutComMethod = useMemo(() => {
    return paymentMethods.find(
      (method) =>
        isCheckoutComPaymentMethod(method.originalCode || "") &&
        !isPayfortPaymentMethod(method.originalCode || "")
    );
  }, [paymentMethods]);

  const isCheckoutComSelected =
    checkoutComMethod && selectedMethod === checkoutComMethod.id;

  // Use a ref to prevent infinite loops when auto-selecting checkout.com
  const isAutoSelectingRef = useRef(false);

  // Memoize the card token ready callback to prevent infinite loops
  const handleCardTokenReadyWhenNotSelected = useCallback(
    (
      token: string,
      card?: null | PaymentCardData,
      cardNumber?: string,
      cvv?: string
    ) => {
      // Only auto-select checkout.com if it's not already selected and we're not already auto-selecting
      if (
        checkoutComMethod &&
        !isCheckoutComSelected &&
        !isAutoSelectingRef.current
      ) {
        isAutoSelectingRef.current = true;
        // Use setTimeout to break the render cycle
        setTimeout(() => {
          onMethodChange(checkoutComMethod.id);
          // Reset the flag after a delay
          setTimeout(() => {
            isAutoSelectingRef.current = false;
          }, 100);
        }, 0);
      }
      // Always call the original callback
      onCardTokenReady(token, card, cardNumber, cvv);
    },
    [checkoutComMethod, isCheckoutComSelected, onMethodChange, onCardTokenReady]
  );

  const handleMethodChange = useCallback(
    (value: string) => {
      trackPaymentMethodSelection(value);
      onMethodChange(value);
    },
    [onMethodChange, trackPaymentMethodSelection]
  );

  return (
    <>
      <CheckoutPaymentTracker shouldShowSkeleton={shouldShowSkeleton} />
      <h2
        className="text-text-primary flex items-center justify-between text-xl font-medium lg:text-[25px] lg:font-semibold"
        data-section="payment-methods"
      >
        <span>{t("payment.title")}</span>
        {shouldShowSkeleton && (
          <span className="font-gilroy ml-4 whitespace-nowrap pt-2 text-[15px] font-normal text-[#85878A]">
            {t("payment.waitingForMoreInfo")}
          </span>
        )}
      </h2>

      <section
        className="shadow-xs mb-2.5 rounded-lg bg-white lg:mb-0"
        data-section="payment-methods-section"
      >
        {shouldShowSkeleton ? (
          <div className="flex items-start justify-between px-4 py-4">
            <div className="flex-1 space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  className="h-4 w-full rounded-full bg-[#F2F3F5]"
                  key={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <RadioGroup
            className="divide-y divide-[var(--divider)] [--divider:rgba(0,0,0,0.08)]"
            data-section="payment-methods-section"
            onValueChange={handleMethodChange}
            value={selectedMethod}
          >
            {paymentMethods.map((method, index) => (
              <div key={method.originalCode || `${method.id}-${index}`}>
                <CheckoutPaymentOption
                  icon={method.icon}
                  isSelected={selectedMethod === method.id}
                  onChange={() => handleMethodChange(method.id)}
                  primary={method.name}
                  secondary={method.description || null}
                  secondaryPrice={method.descriptionPrice || null}
                  value={method.id}
                />
                {method.downtimeAlert && (
                  <PaymentDowntimeAlert message={method.downtimeAlert} />
                )}
                {requiresCardPaymentSection(method.originalCode || "") &&
                  (selectedMethod === method.id ||
                    (isCheckoutComPaymentMethod(method.originalCode || "") &&
                      !isPayfortPaymentMethod(method.originalCode || "") &&
                      initialPaymentCards.length > 0)) && (
                    <>
                      {isPayfortPaymentMethod(method.originalCode || "") ? (
                        <CheckoutCardPaymentSectionPayfort
                          onCardTokenReady={onCardTokenReady}
                          selectedCard={selectedPaymentCard}
                        />
                      ) : (
                        <CheckoutCardPaymentSection
                          cardIdToRestore={cardIdToRestore}
                          disableAutoSelect={
                            disableAutoSelect ||
                            (!isCheckoutComSelected &&
                              isCheckoutComPaymentMethod(
                                method.originalCode || ""
                              ))
                          }
                          initialSavedCards={initialPaymentCards}
                          isDeliverySelected={isDeliverySelected}
                          isPaymentMethodSelected={selectedMethod === method.id}
                          onCardTokenReady={
                            selectedMethod === method.id
                              ? onCardTokenReady
                              : handleCardTokenReadyWhenNotSelected
                          }
                          onSelectPaymentMethod={() => {
                            if (selectedMethod !== method.id) {
                              onMethodChange(method.id);
                            }
                          }}
                          selectedCard={
                            selectedMethod === method.id
                              ? selectedPaymentCard
                              : null
                          }
                        />
                      )}
                    </>
                  )}
                {(isApplePayPaymentMethod(method.id) ||
                  isApplePayPaymentMethod(method.originalCode || "")) &&
                  selectedMethod === method.id && (
                    <div className="px-4 py-3">
                      <CheckoutApplePayButton />
                    </div>
                  )}
              </div>
            ))}
          </RadioGroup>
        )}
      </section>
    </>
  );
}

/**
 * Dynamically determines the icon for a payment method based on its code
 */
function getPaymentMethodIcon(code: string): string {
  const normalizedCode = code.toLowerCase();

  // Apple Pay
  if (isApplePayPaymentMethod(normalizedCode)) {
    return ApplePayIcon;
  }

  if (
    normalizedCode.includes("checkoutcom_pay") ||
    normalizedCode.includes("payfort")
  ) {
    return CardsIcon;
  }

  // Tabby
  if (normalizedCode.includes("tabby")) {
    return TabbyIcon;
  }

  // Tamara
  if (
    normalizedCode.includes("tamara") ||
    normalizedCode.includes("pay_by_instalments") ||
    normalizedCode.includes("instalments")
  ) {
    return TamaraIcon;
  }

  // Cash on Delivery
  if (
    normalizedCode.includes("cod") ||
    normalizedCode.includes("cash") ||
    normalizedCode.includes("delivery")
  ) {
    return MoneyIcon;
  }

  return CardsIcon;
}

/**
 * Determines if a payment method is Payfort
 */
function isPayfortPaymentMethod(code: string): boolean {
  return code.toLowerCase().includes("payfort");
}
