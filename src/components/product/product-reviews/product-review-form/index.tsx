"use client";

import { PropsWithChildren, useEffect } from "react";
import { Controller, FormProvider, useWatch } from "react-hook-form";

import { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslations } from "next-intl";

import { useProductReviewForm } from "@/components/product/product-reviews/product-review-form/hooks/use-product-review-form";
import { StarRating } from "@/components/shared/star-rating";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { AddProductReviewFormField } from "@/lib/forms/add-product-review";

import type { ProductProperties } from "@/lib/analytics/models/event-models";

export const ProductReviewForm = ({
  children,
  product,
  sku,
}: PropsWithChildren<{
  product?: Partial<ProductProperties>;
  sku: string;
}>) => {
  const t = useTranslations("AddProductReviewPage");
  const formErrorMessages = useTranslations("formErrorMessages");

  const customer = useCustomerQuery();

  const { handleSubmitForm, productReviewForm } = useProductReviewForm({
    product,
    sku,
  });

  const isMobile = useIsMobile();

  const nameAllowedChecked = useWatch({
    control: productReviewForm.control,
    name: AddProductReviewFormField.NameAllowed,
  });

  useEffect(() => {
    if (isMobile) {
      window.scrollTo({ top: 0 });
    }
  }, [isMobile]);

  useEffect(() => {
    if (nameAllowedChecked && isMobile) {
      window.scrollTo({ behavior: "smooth", top: document.body.scrollHeight });
    }
  }, [isMobile, nameAllowedChecked]);

  const {
    control,
    formState: { isSubmitting, isValid },
  } = productReviewForm;

  return (
    <FormProvider {...productReviewForm}>
      <form className="flex h-full flex-col" onSubmit={handleSubmitForm}>
        <div className="gap-7.5 flex flex-1 flex-col overflow-y-auto px-5 pb-5 pt-2.5">
          {children}

          <div className="flex flex-col gap-5">
            <p className="text-text-secondary text-sm font-medium">
              {t("reviewProduct.label")}
            </p>
            <Controller
              control={control}
              name={AddProductReviewFormField.Rating}
              render={({ field }) => (
                <StarRating
                  onChangeAction={field.onChange}
                  value={field.value}
                />
              )}
            />
          </div>

          {!customer.data?.firstName && (
            <>
              <Controller
                control={control}
                name={AddProductReviewFormField.FirstName}
                render={({ field, fieldState }) => (
                  <FloatingLabelInput
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message
                        ? formErrorMessages(fieldState.error?.message as any)
                        : undefined
                    }
                    inputProps={{ ...field, maxLength: 50 }}
                    label={t("firstName.label")}
                  />
                )}
              />

              <Controller
                control={control}
                name={AddProductReviewFormField.LastName}
                render={({ field, fieldState }) => (
                  <FloatingLabelInput
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message
                        ? formErrorMessages(fieldState.error?.message as any)
                        : undefined
                    }
                    inputProps={{ ...field, maxLength: 50 }}
                    label={t("lastName.label")}
                  />
                )}
              />
            </>
          )}

          <Controller
            control={control}
            name={AddProductReviewFormField.Title}
            render={({ field, fieldState }) => (
              <FloatingLabelInput
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message
                    ? formErrorMessages(fieldState.error?.message as any)
                    : undefined
                }
                inputProps={{ ...field, maxLength: 50 }}
                label={t("reviewTitle.label")}
              />
            )}
          />

          <div className="flex flex-col gap-5">
            <p className="text-text-secondary text-sm font-medium">
              {t("writeComment.label")}
            </p>
            <Controller
              control={control}
              name={AddProductReviewFormField.Comment}
              render={({ field }) => (
                <Textarea
                  maxLength={250}
                  placeholder={t("writeComment.placeholder")}
                  rows={4}
                  {...field}
                />
              )}
            />
          </div>
        </div>

        <div className="bg-bg-default border-border-base pb-30 gap-7.5 flex flex-col border-t px-5 pt-2.5 lg:pt-5">
          <Controller
            control={control}
            name={AddProductReviewFormField.NameAllowed}
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
                  {t("allowName.label")}
                </Label>
              </div>
            )}
          />
          <FormSubmitButton
            className="w-full"
            disabled={!isValid}
            isSubmitting={isSubmitting}
          >
            {t("submitReview")}
          </FormSubmitButton>
        </div>
      </form>
    </FormProvider>
  );
};
