"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import { RotatingIcon } from "@/components/cart/order/order-summary/order-summary-helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useReverseMokafaaPoints } from "@/hooks/mutations/alrajhi-mokafaa/use-reverse-mokafaa-points";
import { useRouteMatch } from "@/hooks/use-route-match";
import {
  trackMokafaaTransactionReversalAttempt,
  trackMokafaaTransactionReversalAttemptCancel,
  trackMokafaaTransactionReversalAttemptOk,
  trackMokafaaTransactionReversalSuccess,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { isError } from "@/lib/utils/service-result";

export function RemoveMokafaaPointsConfirmationDialog() {
  const t = useTranslations("CartPage.orderSummary.mokafaa");

  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const { isCheckout } = useRouteMatch();

  const [open, setOpen] = useState(false);

  const paymentMethod = cart?.selectedPaymentMethod?.code || "";

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const cartProperties = cart
        ? buildCartProperties(cart, isCheckout ? { storeConfig } : undefined)
        : undefined;
      const eventProperties = cartProperties
        ? { ...cartProperties, payment_method: paymentMethod }
        : undefined;

      trackMokafaaTransactionReversalAttempt(eventProperties);
    }
  };

  const {
    isPending: isReverseMokafaaPointsPending,
    mutate: reverseMokafaaPoints,
  } = useReverseMokafaaPoints();

  const handleConfirm = () => {
    const cartProperties = cart
      ? buildCartProperties(cart, isCheckout ? { storeConfig } : undefined)
      : undefined;
    const eventProperties = cartProperties
      ? { ...cartProperties, payment_method: paymentMethod }
      : undefined;

    trackMokafaaTransactionReversalAttemptOk(eventProperties);
    reverseMokafaaPoints(cart?.id || "", {
      onSettled: () => setOpen(false),
      onSuccess: (result) => {
        if (result && !isError(result)) {
          trackMokafaaTransactionReversalSuccess(eventProperties);
        }
      },
    });
  };

  const handleCancel = () => {
    const cartProperties = cart
      ? buildCartProperties(cart, isCheckout ? { storeConfig } : undefined)
      : undefined;
    const eventProperties = cartProperties
      ? { ...cartProperties, payment_method: paymentMethod }
      : undefined;

    trackMokafaaTransactionReversalAttemptCancel(eventProperties);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <span className="inline-flex cursor-pointer items-center justify-center">
          <RotatingIcon
            active
            activeSrc={CloseIcon}
            inactiveSrc={CloseIcon}
            size={18}
          />
        </span>
      </DialogTrigger>
      <DialogContent
        aria-describedby="remove-mokafaa-description"
        className="sm:max-w-100"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary text-center text-4xl font-normal">
            {t("removeAmountTitle")}
          </DialogTitle>
          <DialogDescription
            className="text-text-tertiary mt-2 text-center text-sm font-normal"
            id="remove-mokafaa-description"
          >
            {t("removeAmountConfirm")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-row gap-2.5">
          <button
            className="text-text-primary h-12.5 border-border-base flex-1 rounded-xl border text-xl font-medium shadow-none"
            disabled={isReverseMokafaaPointsPending}
            onClick={handleConfirm}
            type="button"
          >
            {isReverseMokafaaPointsPending ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner size={16} variant="dark" />
              </div>
            ) : (
              t("removeConfirmYes")
            )}
          </button>
          <button
            className="text-text-primary h-12.5 border-border-base flex-1 rounded-xl border text-xl font-medium shadow-none"
            disabled={isReverseMokafaaPointsPending}
            onClick={handleCancel}
            type="button"
          >
            {t("removeConfirmNo")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
