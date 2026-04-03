"use client";

import { Controller } from "react-hook-form";

import { useTranslations } from "next-intl";

import { useDeleteAccountForm } from "@/components/customer/delete-account/hooks/use-delete-account-form";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { DeleteAccountFormField } from "@/lib/forms/delete-account";

const DELETE_ACCOUNT_REASONS = [
  "no_matching_fragrances",
  "prices_too_high",
  "issues_with_orders_delivery",
  "did_not_benefit_from_offers",
  "prefer_in_store_shopping",
  "favorite_brand_not_available",
  "not_sure_about_authenticity",
];

export const DeleteAccountForm = () => {
  const t = useTranslations("DeleteAccountPage");

  const {
    deleteAccountForm: {
      control,
      formState: { isDirty, isSubmitting },
    },
    handleSubmitForm,
    isNavigating,
  } = useDeleteAccountForm();

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmitForm}>
      <Controller
        control={control}
        name={DeleteAccountFormField.DeleteReason}
        render={({ field }) => {
          return (
            <RadioGroup
              className="flex flex-col gap-0"
              onValueChange={field.onChange}
              value={field.value}
            >
              {DELETE_ACCOUNT_REASONS.map((reason) => (
                <div
                  className="h-12.5 bg-bg-default border-border-base flex items-center justify-between border-b px-5"
                  key={reason}
                >
                  <Label
                    className="transition-default text-text-primary flex flex-1 text-xl font-medium"
                    htmlFor={reason}
                  >
                    {t.has(`reasons.${reason}` as any)
                      ? t(`reasons.${reason}` as any)
                      : reason}
                  </Label>
                  <RadioGroupItem id={reason} value={reason} />
                </div>
              ))}
            </RadioGroup>
          );
        }}
      />
      <div className="flex flex-col gap-2.5 px-5">
        <FormSubmitButton
          className="bg-btn-bg-alert hover:bg-btn-bg-alert"
          disabled={!isDirty}
          isSubmitting={isSubmitting || isNavigating}
        >
          {t("confirm")}
        </FormSubmitButton>
        <Link
          className="h-12.5 text-text-primary flex items-center justify-center rounded-xl text-xl font-medium"
          href={ROUTES.CUSTOMER.ACCOUNT}
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
};
