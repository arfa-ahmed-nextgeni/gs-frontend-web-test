"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import { CheckoutAddCardForm } from "@/components/checkout/payment/checkout-add-card-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { addCustomerPaymentCard } from "@/lib/actions/customer/add-customer-payment-card";
import { trackAddCard } from "@/lib/analytics/events";
import { PaymentCard } from "@/lib/models/payment-card";
import { cn } from "@/lib/utils";
import {
  detectPaymentCardNetwork,
  paymentCardExpiryToMonthYear,
} from "@/lib/utils/payment-card";

import type { PaymentCardData } from "@/components/checkout/checkout-page";

interface CheckoutAddCardModalProps {
  hideSaveCardCheckbox?: boolean;
  initialPaymentCards?: PaymentCardData[]; // To get card count for tracking
  isPayfort?: boolean; // If true, skip tokenization and just pass card data
  onCardAdded: (
    token: string,
    card?: PaymentCardData,
    cardNumber?: string,
    cvv?: string,
    shouldRefreshCards?: boolean
  ) => void;
  onClose: () => void;
  open: boolean;
}

export const CheckoutAddCardModal = ({
  hideSaveCardCheckbox = false,
  initialPaymentCards = [],
  isPayfort = false,
  onCardAdded,
  onClose,
  open,
}: CheckoutAddCardModalProps) => {
  const t = useTranslations("CheckoutPage.addCardDialog");
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    cardExpiry: string;
    cardNumber: string;
    cvv: string;
    saveAsDefault?: boolean;
  }) => {
    setIsSubmitting(true);

    try {
      // Extract card number (remove spaces) and CVV from form data
      const cardNumber = data.cardNumber.replace(/\s/g, "");
      const cvv = data.cvv;

      // For PayFort, skip tokenization - just create a temporary card object and pass raw data
      if (isPayfort) {
        const last4 = cardNumber.slice(-4);

        // Determine card network using the same utility as checkout (for consistent icon matching)
        const detectedNetwork = detectPaymentCardNetwork(cardNumber);
        const cardNetwork = detectedNetwork || "unknown";

        const tempCard: PaymentCardData = {
          cardNetwork,
          expiry: data.cardExpiry,
          id: `temp-payfort-${Date.now()}`,
          isDefault: false,
          isExpired: false,
          last4,
          sourceId: "",
        };

        // For PayFort, pass empty token (not needed), card data, and raw card number + CVV
        onCardAdded("", tempCard, cardNumber, cvv);
        onClose();
        return;
      }

      const { month: expiryMonth, year: expiryYear } =
        paymentCardExpiryToMonthYear(data.cardExpiry);

      // Call our API route which proxies to Checkout.com
      const tokenResponse = await fetch("/api/checkout/create-token", {
        body: JSON.stringify({
          cvv: cvv,
          expiry_month: expiryMonth,
          expiry_year: expiryYear,
          number: cardNumber,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      let tokenData;
      try {
        tokenData = await tokenResponse.json();
      } catch {
        // If response is not valid JSON, create a meaningful error
        const responseText = await tokenResponse.text().catch(() => "");
        throw new Error(
          `Failed to create payment token: ${tokenResponse.status} ${tokenResponse.statusText}${responseText ? ` - ${responseText}` : ""}`
        );
      }

      if (!tokenResponse.ok) {
        const errorMessage =
          tokenData?.error ||
          tokenData?.error_type ||
          tokenData?.message ||
          `Failed to create payment token: ${tokenResponse.status} ${tokenResponse.statusText}`;
        throw new Error(errorMessage);
      }

      if (!tokenData.token) {
        throw new Error("Failed to create payment token: No token in response");
      }

      const token = tokenData.token;
      const last4 = cardNumber.slice(-4);
      const detectedNetwork = detectPaymentCardNetwork(cardNumber);
      const cardNetwork = detectedNetwork || "unknown";

      // Create temp card object from token data and form data
      const tempCardDto = {
        bin: tokenData.bin || cardNumber.substring(0, 6) || "",
        checkout_payment_id: "",
        expiry_month: String(expiryMonth),
        expiry_year: String(expiryYear),
        fingerprint: "",
        id: `temp-${token.slice(-8)}`,
        is_default: 0,
        issuer: tokenData.issuer || "",
        issuer_country: tokenData.issuer_country || "",
        last4: tokenData.last4 || last4,
        type: tokenData.type || cardNetwork,
      };
      const tempCard = new PaymentCard(tempCardDto);
      const savedCard: PaymentCardData = {
        bin: tempCard.bin,
        cardNetwork: tempCard.cardNetwork,
        checkoutPaymentId: null,
        expiry: tempCard.expiry,
        id: tempCard.id,
        isDefault: tempCard.isDefault,
        isExpired: tempCard.isExpired,
        last4: tempCard.last4,
        sourceId: "",
      };

      // Always save the card (whether default or not) so it can be restored after cart refill
      let cardWasSaved = false;
      const saveFormData = new FormData();
      saveFormData.append("card-number", data.cardNumber);
      saveFormData.append("card-expiry", data.cardExpiry);
      saveFormData.append(
        "save-as-default-card",
        data.saveAsDefault ? "true" : "false"
      );

      const saveResult = await addCustomerPaymentCard(saveFormData);
      if (saveResult.success) {
        cardWasSaved = true;
        const cardListSize = initialPaymentCards.length + 1;
        trackAddCard("checkout", cardListSize);
      }

      onCardAdded(token, savedCard, cardNumber, undefined, cardWasSaved);
      onClose();
    } catch (error) {
      console.error("Error adding card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle viewport changes for mobile dialog (e.g., when keyboard appears)
  useEffect(() => {
    if (!isMobile || !open || typeof window === "undefined") return;

    const updateDialogPosition = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (!dialogContent) return;

      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const viewportTop = window.visualViewport.offsetTop;
        const windowHeight = window.innerHeight;
        const diff = windowHeight - viewportHeight;

        // Only apply offset if difference is significant (keyboard is visible)
        // Threshold of 100px to avoid small differences from browser UI
        if (diff > 100) {
          // Position modal at the top of the visible viewport (above keyboard)
          dialogContent.style.bottom = `${windowHeight - viewportHeight - viewportTop}px`;
          dialogContent.style.maxHeight = `${viewportHeight}px`;
          dialogContent.style.height = `${viewportHeight}px`;
        } else {
          // No keyboard, reset to bottom
          dialogContent.style.bottom = "0px";
          dialogContent.style.maxHeight = "90dvh";
          dialogContent.style.height = "auto";
        }
      } else {
        dialogContent.style.bottom = "0px";
        dialogContent.style.maxHeight = "90dvh";
        dialogContent.style.height = "auto";
      }
    };

    // Handle input focus to adjust position when keyboard appears
    const handleInputFocus = (event: Event) => {
      const target = event.target as HTMLElement;
      // Scroll the focused input into view
      setTimeout(() => {
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        updateDialogPosition();
      }, 300);
    };

    const handleInputBlur = () => {
      setTimeout(updateDialogPosition, 300);
    };

    // Set up event listeners after dialog is rendered
    const setupEventListeners = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (!dialogContent) return false;

      // Add input event listeners
      const inputs = dialogContent.querySelectorAll(
        'input[type="text"], input[type="tel"], input[type="number"]'
      );
      inputs.forEach((input) => {
        input.addEventListener("focus", handleInputFocus);
        input.addEventListener("blur", handleInputBlur);
      });

      // Add viewport event listeners
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", updateDialogPosition);
        window.visualViewport.addEventListener("scroll", updateDialogPosition);
      } else {
        window.addEventListener("resize", updateDialogPosition);
      }

      // Initial position update
      updateDialogPosition();
      return true;
    };

    // Try to set up immediately, then retry if dialog not ready
    let setupAttempts = 0;
    const maxAttempts = 10;
    const trySetup = () => {
      if (setupEventListeners() || setupAttempts >= maxAttempts) {
        return;
      }
      setupAttempts++;
      setTimeout(trySetup, 100);
    };

    const initialTimeout = setTimeout(trySetup, 100);

    return () => {
      clearTimeout(initialTimeout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          updateDialogPosition
        );
        window.visualViewport.removeEventListener(
          "scroll",
          updateDialogPosition
        );
      } else {
        window.removeEventListener("resize", updateDialogPosition);
      }
      // Remove input event listeners
      const dialogContentForCleanup = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (dialogContentForCleanup) {
        const inputs = dialogContentForCleanup.querySelectorAll(
          'input[type="text"], input[type="tel"], input[type="number"]'
        );
        inputs.forEach((input) => {
          input.removeEventListener("focus", handleInputFocus);
          input.removeEventListener("blur", handleInputBlur);
        });
      }
      // Reset position on cleanup
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (dialogContent) {
        dialogContent.style.bottom = "";
        dialogContent.style.maxHeight = "";
        dialogContent.style.height = "";
      }
    };
  }, [isMobile, open]);

  if (isMobile) {
    return (
      <Dialog onOpenChange={(open) => !open && onClose()} open={open}>
        <DialogContent
          className={cn(
            "translate-none max-w-auto bottom-0 left-0 top-auto w-full rounded-none p-0",
            "flex max-h-[90dvh] flex-col overflow-hidden"
          )}
          showCloseButton={false}
        >
          <DialogHeader className="py-3.75 border-border-base flex shrink-0 flex-row justify-between border-b px-5">
            <DialogTitle className="text-text-primary text-xl font-medium">
              {t("title")}
            </DialogTitle>
            <DialogClose>
              <Image alt="close" className="size-5" src={CloseIcon} />
            </DialogClose>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <DialogDescription className="text-text-tertiary mt-5 shrink-0 px-5 text-sm font-normal">
              {t("description")}
            </DialogDescription>
            <CheckoutAddCardForm
              containerProps={{
                className: "px-5 pb-6 shrink-0",
              }}
              hideSaveCardCheckbox={hideSaveCardCheckbox}
              isSubmitting={isSubmitting}
              onCancel={onClose}
              onSubmit={handleSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={open}>
      <DialogContent className="w-100 max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="mt-7.5 gap-4">
          <DialogTitle className="text-text-primary text-4xl font-normal">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-text-tertiary text-sm font-normal">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <CheckoutAddCardForm
          hideSaveCardCheckbox={hideSaveCardCheckbox}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
