"use client";

import { useEffect, useRef, useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import TrashIcon from "@/assets/icons/trash-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { usePaymentCardsContext } from "@/contexts/payment-cards-context";
import { deleteCustomerPaymentCard } from "@/lib/actions/customer/delete-customer-payment-card";
import { trackDeleteCard } from "@/lib/analytics/events";

export const DeletePaymentCardButton = ({ id }: { id: string }) => {
  const t = useTranslations("CustomerCardsPage");

  const [isPending, startTransition] = useTransition();

  const { paymentCardsLength } = usePaymentCardsContext();
  const { showError, showSuccess } = useToastContext();

  const successResponse = useRef({
    message: "",
    success: false,
  });

  const handleDeleteCard = () => {
    startTransition(async () => {
      const response = await deleteCustomerPaymentCard({ id });
      if (response.success) {
        // Track delete_card when user deletes a credit card
        // card_list_size is the number of cards after deletion
        const cardListSize = Math.max(0, paymentCardsLength - 1);
        trackDeleteCard(cardListSize, "account");
        successResponse.current = {
          message: response.message || t("messages.Card deleted successfully"),
          success: true,
        };
      } else {
        showError(response.error, " ");
      }
    });
  };

  useEffect(() => {
    if (successResponse.current.success) {
      showSuccess(successResponse.current.message, " ");
      successResponse.current = {
        message: "",
        success: false,
      };
    }
  }, [isPending, showSuccess]);

  return (
    <button
      className="flex flex-row gap-2.5"
      disabled={isPending}
      onClick={handleDeleteCard}
    >
      {isPending ? (
        <Spinner size={15} variant="dark" />
      ) : (
        <Image alt="" height={15} src={TrashIcon} unoptimized width={15} />
      )}
      <p className="text-text-primary text-xs font-normal">{t("delete")}</p>
    </button>
  );
};
