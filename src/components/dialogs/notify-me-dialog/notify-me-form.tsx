"use client";

import { Controller, FormProvider } from "react-hook-form";

import { useTranslations } from "next-intl";

import { useNotifyMeForm } from "@/components/dialogs/notify-me-dialog/hooks/use-notify-me-form";
import { useNotifyMeDialog } from "@/components/dialogs/notify-me-dialog/index";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { NotifyMeFormField } from "@/lib/forms/notify-me";

export const NotifyMeForm = ({ productId }: { productId: string }) => {
  const t = useTranslations("NotifyMeDialog");
  const formErrorMessages = useTranslations("formErrorMessages");
  const { closeDialog } = useNotifyMeDialog();

  const { handleSubmitForm, notifyMeForm } = useNotifyMeForm({
    onSuccess: closeDialog,
    productId,
  });

  const {
    control,
    formState: { isSubmitting },
  } = notifyMeForm;

  return (
    <FormProvider {...notifyMeForm}>
      <form
        className="mt-6.25 flex flex-col gap-10"
        onSubmit={handleSubmitForm}
      >
        <Controller
          control={control}
          name={NotifyMeFormField.Email}
          render={({ field, fieldState }) => (
            <FloatingLabelInput
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message
                  ? formErrorMessages(fieldState.error?.message as any)
                  : undefined
              }
              inputProps={{
                ...field,
                className: "rtl:text-right",
                dir: "ltr",
                disabled: isSubmitting,
                onFocus: (e) => {
                  // Prevent text selection when input receives focus
                  const input = e.target;
                  if (input.value) {
                    // Set cursor to end of text instead of selecting all
                    setTimeout(() => {
                      input.setSelectionRange(
                        input.value.length,
                        input.value.length
                      );
                    }, 0);
                  }
                },
              }}
              label={t("email.label")}
            />
          )}
        />

        <FormSubmitButton isSubmitting={isSubmitting}>
          {t("sendAlert")}
        </FormSubmitButton>
      </form>
    </FormProvider>
  );
};
