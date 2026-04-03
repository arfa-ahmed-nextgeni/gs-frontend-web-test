"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import { useLocale, useTranslations } from "next-intl";

import TrashIcon from "@/assets/icons/trash-icon.svg";
import { CheckoutAddCardModal } from "@/components/checkout/payment/checkout-add-card-modal";
import { useToastContext } from "@/components/providers/toast-provider";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { Spinner } from "@/components/ui/spinner";
import { deleteCustomerPaymentCard } from "@/lib/actions/customer/delete-customer-payment-card";
import { makeDefaultPaymentCard } from "@/lib/actions/customer/make-default-payment-card";
import { trackDeleteCard } from "@/lib/analytics/events";
import { PAYMENT_CARD_NETWORK_ICONS } from "@/lib/constants/payment-card";
import { cn } from "@/lib/utils";

import type { PaymentCardData } from "@/components/checkout/checkout-page";

interface CheckoutSavedCardsModalProps {
  onCardAdded?: (token: string, card?: PaymentCardData) => void;
  onCardCleared?: () => void;
  onCardSelected: (card: PaymentCardData, cvv: string) => void;
  onCardsRefresh?: () => Promise<void> | void;
  onClose: () => void;
  open: boolean;
  savedCards: PaymentCardData[];
  selectedPaymentCardId?: null | string;
}

export const CheckoutSavedCardsModal = ({
  onCardAdded,
  onCardCleared,
  onCardSelected,
  onCardsRefresh,
  onClose,
  open,
  savedCards,
  selectedPaymentCardId,
}: CheckoutSavedCardsModalProps) => {
  const locale = useLocale();
  const isArabic = locale?.toLowerCase().startsWith("ar");
  const t = useTranslations("CheckoutPage.savedCardsDialog");
  const { showError, showSuccess } = useToastContext();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState<null | string>(null);
  const [isMakingDefault, setIsMakingDefault] = useState<null | string>(null);

  const sortedCards = useMemo(() => {
    return [...savedCards].sort((a, b) => {
      if (selectedPaymentCardId) {
        if (a.id === selectedPaymentCardId) return -1;
        if (b.id === selectedPaymentCardId) return 1;
      }

      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      const indexA = savedCards.findIndex((c) => c.id === a.id);
      const indexB = savedCards.findIndex((c) => c.id === b.id);
      return indexA - indexB; // Lower index = comes first = newer
    });
  }, [savedCards, selectedPaymentCardId]);

  const handleCardSelect = async (cardId: string) => {
    const selectedCard = savedCards.find((card) => card.id === cardId);
    if (!selectedCard) {
      return;
    }
    await onCardSelected(selectedCard, "");
    onClose();
  };

  const handleAddCard = (token: string, card?: PaymentCardData) => {
    setShowAddCardModal(false);
    if (onCardAdded) {
      onCardAdded(token, card);
    }
  };

  const handleMakeDefault = async (cardId: string) => {
    setIsMakingDefault(cardId);
    try {
      const response = await makeDefaultPaymentCard({ id: cardId });
      if (response.success) {
        showSuccess(response.message || t("makeDefaultSuccess"), " ");
        // Refresh cards list without closing the drawer
        if (onCardsRefresh) {
          await onCardsRefresh();
        } else {
          // Only reload if no refresh callback is provided
          window.location.reload();
        }
        // Don't close the drawer - keep it open so user can continue
      } else {
        showError(response.error, " ");
      }
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to make card default",
        " "
      );
    } finally {
      setIsMakingDefault(null);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setIsDeletingCard(cardId);
    try {
      const response = await deleteCustomerPaymentCard({ id: cardId });
      if (response.success) {
        // Track delete_card when user deletes a credit card
        // card_list_size is the number of cards after deletion
        const cardListSize = Math.max(0, savedCards.length - 1);
        trackDeleteCard(cardListSize, "checkout");
        showSuccess(response.message || t("deleteSuccess"), " ");

        const isSelectedCard = selectedPaymentCardId === cardId;

        if (onCardsRefresh) {
          await onCardsRefresh();
        } else {
          // Only reload if no refresh callback is provided
          window.location.reload();
        }

        if (isSelectedCard && onCardCleared) {
          onCardCleared();
          onClose();
        }
      } else {
        showError(response.error, " ");
      }
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to delete card",
        " "
      );
    } finally {
      setIsDeletingCard(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <DrawerLayout
        onBack={onClose}
        onClose={onClose}
        showBackButton={true}
        title={t("title")}
        widthClassName="!w-[420px]"
      >
        <div
          className="flex h-full flex-col bg-[#F7F8FA]"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="space-y-5 px-5 pb-5 pt-2.5">
            <button
              className="text-text-primary hover:bg-primary/5 shadow-xs h-[50px] w-full rounded-[10px] bg-white font-[Gilroy] text-[20px] font-medium transition"
              onClick={() => setShowAddCardModal(true)}
              type="button"
            >
              {t("addNewCard")}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-20">
            <div className="flex flex-col gap-4">
              {sortedCards.length === 0 ? (
                <div className="text-text-tertiary text-center text-sm">
                  {t("empty")}
                </div>
              ) : (
                sortedCards.map((card) => {
                  const cardIcon =
                    PAYMENT_CARD_NETWORK_ICONS[
                      card.cardNetwork as keyof typeof PAYMENT_CARD_NETWORK_ICONS
                    ];
                  const isActiveForPayment =
                    selectedPaymentCardId && card.id === selectedPaymentCardId;

                  return (
                    <div
                      className={cn(
                        "hover:border-primary/60 rounded-[10px] border bg-white transition",
                        {
                          "border-[#F3F3F3]": !isActiveForPayment,
                          "border-primary border-[1px] shadow-sm":
                            isActiveForPayment,
                        }
                      )}
                      key={card.id}
                      onClick={() => handleCardSelect(card.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className={cn(
                          "lg:gap-18 flex items-center gap-10 px-4 py-4",
                          isArabic ? "flex-row-reverse" : ""
                        )}
                      >
                        {cardIcon && (
                          <Image
                            alt="Card network"
                            className="shrink-0"
                            src={cardIcon}
                            unoptimized
                          />
                        )}
                        <div className="flex flex-1 items-center gap-10 lg:gap-12">
                          <p className="text-text-primary text-xs font-medium">
                            {t("cardEndingIn")}{" "}
                            <span className="ml-1 font-bold">{card.last4}</span>
                          </p>
                          <p className="text-text-secondary text-xs">
                            {t("expiry")}{" "}
                            <span className="font-bold">{card.expiry}</span>
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex items-center justify-between border-t border-[#E4E7EC] px-4 py-2.5",
                          isArabic ? "flex-row-reverse" : ""
                        )}
                      >
                        {card.isDefault ? (
                          <button
                            className="h-[25px] min-w-[90px] rounded-[10px] bg-[#374957] px-2.5 text-center text-[11px] font-medium text-white disabled:opacity-50"
                            type="button"
                          >
                            {t("default")}
                          </button>
                        ) : (
                          <button
                            className="h-[25px] min-w-[90px] rounded-[10px] border border-[#D1D5DB] bg-white px-2.5 text-center text-[11px] font-medium text-[#6B7280] hover:bg-gray-50 disabled:opacity-50"
                            disabled={isMakingDefault !== null}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleMakeDefault(card.id);
                            }}
                            type="button"
                          >
                            {isMakingDefault === card.id ? (
                              <Spinner
                                className="mx-auto"
                                label="Loading"
                                size={15}
                                variant="dark"
                              />
                            ) : (
                              t("makeDefault")
                            )}
                          </button>
                        )}
                        <button
                          className="text-text-secondary inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
                          disabled={isDeletingCard !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteCard(card.id);
                          }}
                          type="button"
                        >
                          {isDeletingCard === card.id ? (
                            <Spinner label="Loading" size={15} variant="dark" />
                          ) : (
                            <>
                              <Image
                                alt="Delete"
                                height={15}
                                src={TrashIcon}
                                unoptimized
                                width={15}
                              />
                              {t("delete")}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DrawerLayout>

      <CheckoutAddCardModal
        onCardAdded={handleAddCard}
        onClose={() => setShowAddCardModal(false)}
        open={showAddCardModal}
      />
    </>
  );
};
