"use client";

import { ComponentProps } from "react";
import { Controller } from "react-hook-form";

import { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslations } from "next-intl";

import { useAddPaymentCardForm } from "@/components/customer/cards/hooks/use-add-payment-card-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { CreditCardExpiryInput } from "@/components/ui/inputs/credit-card-expiry-input";
import { CreditCardNumberInput } from "@/components/ui/inputs/credit-card-number-input";
import { Label } from "@/components/ui/label";
import { usePaymentCardsContext } from "@/contexts/payment-cards-context";
import { AddPaymentCardFormField } from "@/lib/forms/add-payment-card";
import { cn } from "@/lib/utils";

export const AddPaymentCardForm = ({
  closeDialogAction,
  containerProps,
}: {
  closeDialogAction: () => void;
  containerProps?: ComponentProps<"form">;
}) => {
  const t = useTranslations("CustomerCardsPage.addNewCardDialog");

  const { paymentCardsLength } = usePaymentCardsContext();

  const {
    addPaymentCardForm: {
      control,
      formState: { isSubmitted, isSubmitting },
    },
    handleSubmitForm,
    isRefreshing,
  } = useAddPaymentCardForm({ closeDialog: closeDialogAction });

  return (
    <form
      {...containerProps}
      className={cn("gap-7.5 mt-7.5 flex flex-col", containerProps?.className)}
      onSubmit={handleSubmitForm}
    >
      <Controller
        control={control}
        name={AddPaymentCardFormField.CardNumber}
        render={({ field, fieldState }) => (
          <CreditCardNumberInput
            error={(fieldState.isTouched || isSubmitted) && !!fieldState.error}
            helperText={
              (fieldState.isTouched || isSubmitted) && fieldState.error?.message
                ? t(fieldState.error?.message as any)
                : undefined
            }
            inputProps={{
              ...field,
              placeholder: t("cardNumberInput.placeholder"),
            }}
            label={t("cardNumberInput.label")}
            success={fieldState.isDirty && !fieldState.invalid}
          />
        )}
      />
      <Controller
        control={control}
        name={AddPaymentCardFormField.CardExpiry}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error;

          return (
            <CreditCardExpiryInput
              error={(fieldState.isTouched || isSubmitted) && hasError}
              helperText={
                (fieldState.isTouched || isSubmitted) &&
                fieldState.error?.message
                  ? t(fieldState.error?.message as any)
                  : undefined
              }
              inputProps={{
                ...field,
                placeholder: t("cardExpiryInput.placeholder"),
              }}
              label={t("cardExpiryInput.label")}
              success={fieldState.isDirty && !fieldState.invalid}
            />
          );
        }}
      />
      <Controller
        control={control}
        name={AddPaymentCardFormField.SaveAsDefault}
        render={({ field }) => (
          <div className="transition-default flex transform items-center gap-2.5 py-1.5">
            <Checkbox
              checked={field.value as CheckedState}
              className="peer size-4"
              disabled={!paymentCardsLength}
              id={field.name}
              name={field.name}
              onBlur={field.onBlur}
              onCheckedChange={field.onChange}
              ref={field.ref}
            />
            <Label
              className="transition-default text-text-primary block text-sm font-medium peer-data-[state=checked]:font-semibold"
              htmlFor={field.name}
            >
              {t("setAsDefaultCard")}
            </Label>
          </div>
        )}
      />
      <FormSubmitButton isSubmitting={isSubmitting || isRefreshing}>
        {t("submitButton.label")}
      </FormSubmitButton>
    </form>
  );
};
