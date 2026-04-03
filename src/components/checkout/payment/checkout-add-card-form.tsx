"use client";

import { ComponentProps } from "react";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { CreditCardCvvInput } from "@/components/ui/inputs/credit-card-cvv-input";
import { CreditCardExpiryInput } from "@/components/ui/inputs/credit-card-expiry-input";
import { CreditCardNumberInput } from "@/components/ui/inputs/credit-card-number-input";
import { Label } from "@/components/ui/label";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import {
  trackCheckoutPaymentCcCvc,
  trackCheckoutPaymentCcDate,
  trackCheckoutPaymentCcNumber,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import {
  CheckoutPaymentCardFormField,
  checkoutPaymentCardFormSchema,
} from "@/lib/forms/checkout-payment-card";
import { cn } from "@/lib/utils";

interface CheckoutAddCardFormProps {
  containerProps?: ComponentProps<"form">;
  hideSaveCardCheckbox?: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (data: {
    cardExpiry: string;
    cardNumber: string;
    cvv: string;
    saveAsDefault?: boolean;
  }) => Promise<void>;
}

export const CheckoutAddCardForm = ({
  containerProps,
  hideSaveCardCheckbox = false,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: CheckoutAddCardFormProps) => {
  const t = useTranslations("CheckoutPage.addCardDialog");
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();

  const form = useForm({
    defaultValues: {
      [CheckoutPaymentCardFormField.CardExpiry]: "",
      [CheckoutPaymentCardFormField.CardNumber]: "",
      [CheckoutPaymentCardFormField.Cvv]: "",
      [CheckoutPaymentCardFormField.SaveAsDefault]: true,
    },
    mode: "onChange",
    resolver: zodResolver(checkoutPaymentCardFormSchema),
  });

  const {
    control,
    formState: { isSubmitted, isSubmitting: formIsSubmitting, isValid },
    handleSubmit,
  } = form;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      cardExpiry: data[CheckoutPaymentCardFormField.CardExpiry],
      cardNumber: data[CheckoutPaymentCardFormField.CardNumber],
      cvv: data[CheckoutPaymentCardFormField.Cvv],
      saveAsDefault: data[CheckoutPaymentCardFormField.SaveAsDefault],
    });
  });

  return (
    <form
      {...containerProps}
      className={cn("mt-7.5 flex flex-col gap-6", containerProps?.className)}
      onSubmit={handleFormSubmit}
    >
      <Controller
        control={control}
        name={CheckoutPaymentCardFormField.CardNumber}
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
              onBlur: () => {
                field.onBlur();
                // Track checkout_payment_cc_number when field loses focus
                if (cart) {
                  const cartProperties = buildCartProperties(cart, {
                    storeConfig,
                  });
                  trackCheckoutPaymentCcNumber(cartProperties);
                }
              },
              placeholder: t("cardNumberInput.placeholder"),
            }}
            label={t("cardNumberInput.label")}
            success={fieldState.isDirty && !fieldState.invalid}
          />
        )}
      />
      <div className="flex gap-4">
        <div className="flex-1">
          <Controller
            control={control}
            name={CheckoutPaymentCardFormField.CardExpiry}
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
                    onBlur: () => {
                      field.onBlur();
                      // Track checkout_payment_cc_date when field loses focus
                      if (cart) {
                        const cartProperties = buildCartProperties(cart, {
                          storeConfig,
                        });
                        const paymentMethod =
                          cart.selectedPaymentMethod?.code || "";
                        trackCheckoutPaymentCcDate({
                          ...cartProperties,
                          payment_method: paymentMethod,
                        });
                      }
                    },
                    placeholder: t("cardExpiryInput.placeholder"),
                  }}
                  label={t("cardExpiryInput.label")}
                  success={fieldState.isDirty && !fieldState.invalid}
                />
              );
            }}
          />
        </div>
        <div className="flex-1">
          <Controller
            control={control}
            name={CheckoutPaymentCardFormField.Cvv}
            render={({ field, fieldState }) => (
              <CreditCardCvvInput
                error={
                  (fieldState.isTouched || isSubmitted) && !!fieldState.error
                }
                helperText={
                  (fieldState.isTouched || isSubmitted) &&
                  fieldState.error?.message
                    ? t(fieldState.error?.message as any)
                    : undefined
                }
                inputProps={{
                  ...field,
                  onBlur: () => {
                    field.onBlur();
                    // Track checkout_payment_cc_cvc when field loses focus
                    if (cart) {
                      const cartProperties = buildCartProperties(cart, {
                        storeConfig,
                      });
                      trackCheckoutPaymentCcCvc(cartProperties);
                    }
                  },
                  placeholder: t("cvvInput.placeholder"),
                }}
                label={t("cvvInput.label")}
                success={fieldState.isDirty && !fieldState.invalid}
              />
            )}
          />
        </div>
      </div>
      {!hideSaveCardCheckbox && (
        <Controller
          control={control}
          name={CheckoutPaymentCardFormField.SaveAsDefault}
          render={({ field }) => (
            <div className="transition-default flex transform items-center gap-2.5 py-1.5">
              <Checkbox
                checked={field.value as CheckedState}
                className="peer size-4"
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
      )}
      <div className="flex gap-3">
        <FormSubmitButton
          className={onCancel ? "flex-1" : "w-full"}
          disabled={!isValid}
          isSubmitting={isSubmitting || formIsSubmitting}
        >
          {t("submitButton.label")}
        </FormSubmitButton>
      </div>
    </form>
  );
};
