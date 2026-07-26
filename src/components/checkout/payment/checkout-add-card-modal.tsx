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
import { PaymentCardNetwork } from "@/lib/constants/payment-card";
import { PaymentCard } from "@/lib/models/payment-card";
import { cn } from "@/lib/utils";
import { detectPaymentCardNetwork } from "@/lib/utils/payment-card";

import type { PaymentCardData } from "@/components/checkout/checkout-page";
import type { CheckoutComCardFieldsResult } from "@/components/checkout/payment/checkout-com-card-fields";

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

  const handlePayfortSubmit = async (data: {
    cardExpiry: string;
    cardNumber: string;
    cvv: string;
    saveAsDefault?: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      const cardNumber = data.cardNumber.replace(/\s/g, "");
      const last4 = cardNumber.slice(-4);
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

      onCardAdded("", tempCard, cardNumber, data.cvv);
      onClose();
    } catch (error) {
      console.error("Error adding PayFort card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTokenSubmit = async (
    result: CheckoutComCardFieldsResult,
    saveAsDefault: boolean
  ) => {
    setIsSubmitting(true);

    try {
      const { bin, expiryMonth, expiryYear, last4, scheme, token } = result;
      const detectedNetwork = bin
        ? detectPaymentCardNetwork(bin)
        : PaymentCardNetwork.Unknown;
      const cardNetwork = detectedNetwork || scheme || "unknown";

      const tempCardDto = {
        bin: bin || "",
        checkout_payment_id: "",
        expiry_month: String(expiryMonth),
        expiry_year: String(expiryYear),
        fingerprint: "",
        id: `temp-${token.slice(-8)}`,
        is_default: 0,
        issuer: "",
        issuer_country: "",
        last4,
        type: cardNetwork,
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

      // Verification item (see design doc): confirm whether Checkout.com
      // allows reusing this same `token` for both the immediate payment
      // (below, via onCardAdded) and this save-for-later call, or whether
      // a second Frames.submitCard() is required to mint a fresh token.
      // Defaulting to reusing the same token until confirmed otherwise.
      let cardWasSaved = false;
      const saveFormData = new FormData();
      saveFormData.append("checkout-com-token", token);
      saveFormData.append(
        "save-as-default-card",
        saveAsDefault ? "true" : "false"
      );

      const saveResult = await addCustomerPaymentCard(saveFormData);
      if (saveResult.success) {
        cardWasSaved = true;
        const cardListSize = initialPaymentCards.length + 1;
        trackAddCard("checkout", cardListSize);
      }

      onCardAdded(token, savedCard, undefined, undefined, cardWasSaved);
      onClose();
    } catch (error) {
      console.error("Error adding card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isMobile || !open || typeof window === "undefined") return;

    const updateDialogPosition = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (!dialogContent) return;

      const vv = window.visualViewport;
      if (vv) {
        const windowHeight = window.innerHeight;
        const diff = windowHeight - vv.height;

        if (diff > 100) {
          dialogContent.style.bottom = `${windowHeight - vv.height - vv.offsetTop}px`;
          dialogContent.style.maxHeight = `${vv.height}px`;
          dialogContent.style.height = `${vv.height}px`;
        } else {
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

    const handleInputFocus = (event: Event) => {
      const target = event.target as HTMLElement;
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        updateDialogPosition();
      }, 300);
    };

    const handleInputBlur = () => {
      setTimeout(updateDialogPosition, 300);
    };

    let attachedInputs: NodeListOf<Element> | null = null;

    const setupEventListeners = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      if (!dialogContent) return false;

      const inputs = dialogContent.querySelectorAll(
        'input[type="text"], input[type="tel"], input[type="number"]'
      );
      inputs.forEach((input) => {
        input.addEventListener("focus", handleInputFocus);
        input.addEventListener("blur", handleInputBlur);
      });
      attachedInputs = inputs;

      updateDialogPosition();
      return true;
    };

    let setupAttempts = 0;
    const maxAttempts = 10;
    let pendingTimeout: null | ReturnType<typeof setTimeout> = null;
    const trySetup = () => {
      if (setupEventListeners() || setupAttempts >= maxAttempts) {
        return;
      }
      setupAttempts++;
      pendingTimeout = setTimeout(trySetup, 100);
    };

    pendingTimeout = setTimeout(trySetup, 100);

    window.visualViewport?.addEventListener("resize", updateDialogPosition);
    window.visualViewport?.addEventListener("scroll", updateDialogPosition);

    return () => {
      if (pendingTimeout) clearTimeout(pendingTimeout);
      window.visualViewport?.removeEventListener(
        "resize",
        updateDialogPosition
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        updateDialogPosition
      );

      if (attachedInputs) {
        attachedInputs.forEach((input) => {
          input.removeEventListener("focus", handleInputFocus);
          input.removeEventListener("blur", handleInputBlur);
        });
      }

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
              isPayfort={isPayfort}
              isSubmitting={isSubmitting}
              onCancel={onClose}
              onPayfortSubmit={handlePayfortSubmit}
              onTokenSubmit={handleTokenSubmit}
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
          isPayfort={isPayfort}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onPayfortSubmit={handlePayfortSubmit}
          onTokenSubmit={handleTokenSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
