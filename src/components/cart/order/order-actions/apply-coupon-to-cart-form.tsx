"use client";

import { ComponentProps, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useTranslations } from "next-intl";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useApplyCouponToCart } from "@/hooks/mutations/cart/use-apply-coupon-to-cart";
import { useRouteMatch } from "@/hooks/use-route-match";
import { trackCheckoutPromocode } from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { cn } from "@/lib/utils";

type FormValues = {
  couponCode: string;
};

export const ApplyCouponToCartForm = ({
  closeDialogAction,
  containerProps,
}: {
  closeDialogAction: () => void;
  containerProps?: ComponentProps<"form">;
}) => {
  const { isCheckout } = useRouteMatch();
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const t = useTranslations("CartPage.orderSummary.applyCoupon");

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { couponCode: "" },
  });

  const [apiError, setApiError] = useState<null | string>(null);

  const applyCouponMutation = useApplyCouponToCart();

  const couponValue = useWatch({
    control,
    name: "couponCode",
  });

  const onSubmit = (data: FormValues) => {
    setApiError(null); // Reset API error on new submit

    // Track checkout_promocode when coupon apply is attempted in checkout
    if (isCheckout && cart) {
      const cartProperties = buildCartProperties(
        cart,
        isCheckout ? { storeConfig } : undefined
      );
      trackCheckoutPromocode(cartProperties, data.couponCode);
    }

    applyCouponMutation.mutate(data, {
      onError: (err: any) => {
        setApiError(err?.message || t("invalid"));
      },
      onSuccess: (res) => {
        // Only close if no error
        if (!res || (res as any).error) {
          setApiError((res as any).error || t("invalid"));
          return;
        }
        closeDialogAction();
      },
    });
  };

  return (
    <form
      {...containerProps}
      className={cn("mt-9 flex flex-col", containerProps?.className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="couponCode"
        render={({ field, fieldState }) => (
          <FloatingLabelInput
            {...field}
            error={!!fieldState.error || !!apiError}
            helperText={apiError || fieldState.error?.message}
            inputProps={{
              ...field,
              autoCapitalize: "characters",
              maxLength: 20,
              placeholder: t("inputPlaceholder"),
              type: "text",
            }}
            label={t("inputLabel")}
          />
        )}
        rules={{ required: t("invalid") }}
      />

      <FormSubmitButton
        className="mt-10"
        disabled={!couponValue || applyCouponMutation.isPending}
        isSubmitting={applyCouponMutation.isPending}
      >
        {t("apply")}
      </FormSubmitButton>
    </form>
  );
};
