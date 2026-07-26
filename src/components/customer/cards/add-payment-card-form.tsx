"use client";

import { ComponentProps, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import {
  CheckoutComCardFields,
  type CheckoutComCardFieldsHandle,
  type CheckoutComCardFieldsResult,
} from "@/components/checkout/payment/checkout-com-card-fields";
import { useAddPaymentCardForm } from "@/components/customer/cards/hooks/use-add-payment-card-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Label } from "@/components/ui/label";
import { useCheckoutFramesContext } from "@/contexts/checkout-frames-context";
import { usePaymentCardsContext } from "@/contexts/payment-cards-context";
import { cn } from "@/lib/utils";

export const AddPaymentCardForm = ({
  closeDialogAction,
  containerProps,
}: {
  closeDialogAction: () => void;
  containerProps?: ComponentProps<"form">;
}) => {
  const t = useTranslations("CustomerCardsPage.addNewCardDialog");
  const { isScriptLoaded, publicKey } = useCheckoutFramesContext();
  const { paymentCardsLength } = usePaymentCardsContext();

  const { isRefreshing, submitToken } = useAddPaymentCardForm({
    closeDialog: closeDialogAction,
  });

  const [isCardValid, setIsCardValid] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(!paymentCardsLength);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const handleRef = useRef<CheckoutComCardFieldsHandle>(null);

  const handleCardTokenized = async (result: CheckoutComCardFieldsResult) => {
    setIsTokenizing(false);
    await submitToken(result.token, saveAsDefault);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleRef.current || !isCardValid) return;
    setIsTokenizing(true);
    try {
      await handleRef.current.submit();
    } catch {
      setIsTokenizing(false);
    }
  };

  return (
    <form
      {...containerProps}
      className={cn("gap-7.5 mt-7.5 flex flex-col", containerProps?.className)}
      onSubmit={handleFormSubmit}
    >
      <CheckoutComCardFields
        handleRef={handleRef}
        isScriptLoaded={isScriptLoaded}
        onCardTokenized={handleCardTokenized}
        onTokenizationFailed={() => setIsTokenizing(false)}
        onValidityChange={setIsCardValid}
        publicKey={publicKey}
        showCvv={false}
      />
      <div className="transition-default flex transform items-center gap-2.5 py-1.5">
        <Checkbox
          checked={saveAsDefault}
          className="peer size-4"
          disabled={!paymentCardsLength}
          id="save-as-default-card"
          onCheckedChange={(checked) => setSaveAsDefault(!!checked)}
        />
        <Label
          className="transition-default text-text-primary block text-sm font-medium peer-data-[state=checked]:font-semibold"
          htmlFor="save-as-default-card"
        >
          {t("setAsDefaultCard")}
        </Label>
      </div>
      <FormSubmitButton
        disabled={!isCardValid}
        isSubmitting={isTokenizing || isRefreshing}
      >
        {t("submitButton.label")}
      </FormSubmitButton>
    </form>
  );
};
