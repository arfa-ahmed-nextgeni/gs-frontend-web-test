"use client";

import { useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { usePaymentCardsContext } from "@/contexts/payment-cards-context";
import { useRouter } from "@/i18n/navigation";
import { makeDefaultPaymentCard } from "@/lib/actions/customer/make-default-payment-card";

export const MakePaymentCardDefaultButton = ({ id }: { id: string }) => {
  const router = useRouter();

  const t = useTranslations("CustomerCardsPage");

  const {
    isUpdatingDefaultCard,
    pendingCardId,
    setPendingCardId,
    startUpdateDefaultCard,
  } = usePaymentCardsContext();

  const { showError } = useToastContext();

  const handleMakeDefaultCard = () => {
    setPendingCardId(id);
    startUpdateDefaultCard(async () => {
      const response = await makeDefaultPaymentCard({ id });
      if (response.success) {
        startUpdateDefaultCard(() => {
          router.refresh();
          setPendingCardId(null);
        });
      } else {
        showError(response.error, " ");
        setPendingCardId(null);
      }
    });
  };

  return (
    <button
      className="h-6.25 border-border-muted text-text-placeholder min-w-18.5 rounded-xl border bg-transparent px-2.5 text-center text-xs font-medium"
      disabled={isUpdatingDefaultCard}
      onClick={handleMakeDefaultCard}
    >
      {pendingCardId === id ? (
        <Spinner className="mx-auto" label="Loading" size={15} variant="dark" />
      ) : (
        t("makeDefault")
      )}
    </button>
  );
};
