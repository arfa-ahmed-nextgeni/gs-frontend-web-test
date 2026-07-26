"use client";

import { ComponentProps, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslations } from "next-intl";

import {
  CheckoutComCardFields,
  type CheckoutComCardFieldsHandle,
  type CheckoutComCardFieldsResult,
} from "@/components/checkout/payment/checkout-com-card-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { CreditCardCvvInput } from "@/components/ui/inputs/credit-card-cvv-input";
import { CreditCardExpiryInput } from "@/components/ui/inputs/credit-card-expiry-input";
import { CreditCardNumberInput } from "@/components/ui/inputs/credit-card-number-input";
import { Label } from "@/components/ui/label";
import { useCheckoutFramesContext } from "@/contexts/checkout-frames-context";
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
  payfortPaymentCardFormSchema,
} from "@/lib/forms/checkout-payment-card";
import { cn } from "@/lib/utils";

import type { CheckoutComFramesFieldName } from "@/hooks/checkout/use-checkout-com-frames";

interface CheckoutAddCardFormProps {
  containerProps?: ComponentProps<"form">;
  hideSaveCardCheckbox?: boolean;
  isPayfort?: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onPayfortSubmit?: (data: {
    cardExpiry: string;
    cardNumber: string;
    cvv: string;
    saveAsDefault?: boolean;
  }) => Promise<void>;
  onTokenSubmit?: (
    result: CheckoutComCardFieldsResult,
    saveAsDefault: boolean
  ) => Promise<void>;
}

export const CheckoutAddCardForm = ({
  containerProps,
  hideSaveCardCheckbox = false,
  isPayfort = false,
  isSubmitting = false,
  onCancel,
  onPayfortSubmit,
  onTokenSubmit,
}: CheckoutAddCardFormProps) => {
  if (isPayfort) {
    return (
      <PayfortAddCardForm
        containerProps={containerProps}
        hideSaveCardCheckbox={hideSaveCardCheckbox}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onPayfortSubmit!}
      />
    );
  }

  return (
    <CheckoutComAddCardForm
      containerProps={containerProps}
      hideSaveCardCheckbox={hideSaveCardCheckbox}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      onSubmit={onTokenSubmit!}
    />
  );
};

const CheckoutComAddCardForm = ({
  containerProps,
  hideSaveCardCheckbox,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  containerProps?: ComponentProps<"form">;
  hideSaveCardCheckbox: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit: (
    result: CheckoutComCardFieldsResult,
    saveAsDefault: boolean
  ) => Promise<void>;
}) => {
  const t = useTranslations("CheckoutPage.addCardDialog");
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const { isScriptLoaded, publicKey } = useCheckoutFramesContext();
  const [isCardValid, setIsCardValid] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const handleRef = useRef<CheckoutComCardFieldsHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleCardTokenized = async (result: CheckoutComCardFieldsResult) => {
    setIsTokenizing(false);
    await onSubmit(result, saveAsDefault);
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

  const handleFieldBlur = (field: CheckoutComFramesFieldName) => {
    if (!cart) return;
    const cartProperties = buildCartProperties(cart, { storeConfig });
    if (field === "card-number") trackCheckoutPaymentCcNumber(cartProperties);
    if (field === "expiry-date") {
      const paymentMethod = cart.selectedPaymentMethod?.code || "";
      trackCheckoutPaymentCcDate({
        ...cartProperties,
        payment_method: paymentMethod,
      });
    }
    if (field === "cvv") trackCheckoutPaymentCcCvc(cartProperties);
  };

  const handleFieldFocus = (field: CheckoutComFramesFieldName) => {
    const frameClassMap: Record<CheckoutComFramesFieldName, string> = {
      "card-number": "card-number-frame",
      cvv: "cvv-frame",
      "expiry-date": "expiry-date-frame",
    };
    const frameEl = formRef.current?.querySelector(`.${frameClassMap[field]}`);
    if (frameEl) {
      setTimeout(() => {
        frameEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  };

  return (
    <form
      {...containerProps}
      className={cn("mt-7.5 flex flex-col gap-6", containerProps?.className)}
      onSubmit={handleFormSubmit}
      ref={formRef}
    >
      <CheckoutComCardFields
        handleRef={handleRef}
        isScriptLoaded={isScriptLoaded}
        onCardTokenized={handleCardTokenized}
        onFieldBlur={handleFieldBlur}
        onFieldFocus={handleFieldFocus}
        onTokenizationFailed={() => setIsTokenizing(false)}
        onValidityChange={setIsCardValid}
        publicKey={publicKey}
      />
      {!hideSaveCardCheckbox && (
        <div className="transition-default flex transform items-center gap-2.5 py-1.5">
          <Checkbox
            checked={saveAsDefault}
            className="peer size-4"
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
      )}
      <div className="flex gap-3">
        <FormSubmitButton
          className={onCancel ? "flex-1" : "w-full"}
          disabled={!isCardValid}
          isSubmitting={isSubmitting || isTokenizing}
        >
          {t("submitButton.label")}
        </FormSubmitButton>
      </div>
    </form>
  );
};

const PayfortAddCardForm = ({
  containerProps,
  hideSaveCardCheckbox = false,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: {
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
}) => {
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
    resolver: zodResolver(payfortPaymentCardFormSchema),
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
