"use client";

import { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import DeleteIcon from "@/assets/icons/trash-icon.svg";
import { CheckoutAddCardModal } from "@/components/checkout/payment/checkout-add-card-modal";
import { PAYMENT_CARD_NETWORK_ICONS } from "@/lib/constants/payment-card";

import type { PaymentCardData } from "@/components/checkout/checkout-page";

interface CheckoutCardPaymentSectionPayfortProps {
  onCardTokenReady: (
    token: string,
    card?: PaymentCardData,
    cardNumber?: string,
    cvv?: string
  ) => void;
  selectedCard: null | PaymentCardData;
}

export const CheckoutCardPaymentSectionPayfort = ({
  onCardTokenReady,
  selectedCard,
}: CheckoutCardPaymentSectionPayfortProps) => {
  const t = useTranslations("CheckoutPage.cardPaymentSection");
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  const handleAddNewCard = () => {
    setShowAddCardModal(true);
  };

  const handleDeleteCard = () => {
    // Clear the selected card by calling onCardTokenReady with empty values
    onCardTokenReady("", undefined, undefined);
    // Close the modal if it's open
    setShowAddCardModal(false);
  };

  const handleCardTokenReady = (
    token: string,
    card?: PaymentCardData,
    cardNumber?: string,
    cvv?: string
  ) => {
    onCardTokenReady(token, card, cardNumber, cvv);
    setShowAddCardModal(false);
  };

  if (selectedCard) {
    const cardIcon =
      PAYMENT_CARD_NETWORK_ICONS[
        selectedCard.cardNetwork as keyof typeof PAYMENT_CARD_NETWORK_ICONS
      ];

    return (
      <>
        <div className="border-border-base border-t">
          <div className="flex items-center justify-between px-8 py-3">
            <div className="flex items-center gap-5">
              {cardIcon && (
                <Image
                  alt="Card network"
                  className="shrink-0"
                  src={cardIcon}
                  unoptimized
                />
              )}
              <p className="text-text-primary text-[15px] font-normal">
                <span className="hidden lg:inline">XXXX XXXX XXXX </span>
                {selectedCard.last4}
              </p>
              <p className="text-text-primary text-[15px] font-normal">
                {t("expires")} {selectedCard.expiry}
              </p>
            </div>
            <button
              className="text-text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium"
              onClick={handleDeleteCard}
              type="button"
            >
              <Image
                alt={t("delete")}
                height={15}
                src={DeleteIcon}
                unoptimized
                width={15}
              />
              {t("delete")}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="border-border-base border-t">
        <button
          className="text-text-primary hover:bg-bg-surface h-[45px] w-full px-4 py-2 text-center text-[20px] font-medium transition-colors"
          onClick={handleAddNewCard}
          type="button"
        >
          {t("addNewCard")}
        </button>
      </div>

      <CheckoutAddCardModal
        hideSaveCardCheckbox={true}
        isPayfort={true}
        onCardAdded={(token, card, cardNumber, cvv) => {
          handleCardTokenReady(token, card, cardNumber, cvv);
        }}
        onClose={() => setShowAddCardModal(false)}
        open={showAddCardModal}
      />
    </>
  );
};
