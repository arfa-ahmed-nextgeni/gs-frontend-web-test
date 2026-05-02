"use client";

import React from "react";
import { Controller, FormProvider } from "react-hook-form";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import z from "zod";

import { useProfileForm } from "@/components/customer/profile/hooks/use-profile-form";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { DatePickerInput } from "@/components/ui/inputs/date-picker-input";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UpdateProfileFormField } from "@/lib/forms/update-profile";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { labelKey: "female", value: "2" },
  { labelKey: "male", value: "1" },
];

export const ProfileForm = ({
  dateOfBirth,
  email,
  firstName,
  gender,
  isProfileComplete,
  lastName,
  phoneNumber,
}: {
  dateOfBirth?: null | string;
  email?: null | string;
  firstName?: null | string;
  gender?: null | number;
  isProfileComplete?: boolean;
  lastName?: null | string;
  phoneNumber?: null | string;
}) => {
  const t = useTranslations("CustomerProfilePage");

  const { handleSubmitForm, updateProfileForm } = useProfileForm({
    dateOfBirth,
    email,
    firstName,
    gender,
    lastName,
    phoneNumber,
  });

  const {
    control,
    formState: { isDirty, isSubmitting },
  } = updateProfileForm;

  const hasRegisteredEmail = z.email().safeParse(email).success;

  return (
    <FormProvider {...updateProfileForm}>
      <form
        className="gap-y-7.5 mt-7.5 grid grid-cols-2 gap-x-2.5"
        onSubmit={handleSubmitForm}
      >
        <div className="col-span-2 grid grid-cols-2 gap-x-2.5 gap-y-5">
          <Label className="text-text-secondary col-span-2 text-sm font-medium lg:hidden">
            {t("accountInfo")}
          </Label>

          <Controller
            control={control}
            name={UpdateProfileFormField.FirstName}
            render={({ field, fieldState }) => (
              <FloatingLabelInput
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message
                    ? t(fieldState.error?.message as any)
                    : undefined
                }
                inputProps={{ ...field, maxLength: 50 }}
                label={t("firstName")}
              />
            )}
          />

          <Controller
            control={control}
            name={UpdateProfileFormField.LastName}
            render={({ field, fieldState }) => (
              <FloatingLabelInput
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message
                    ? t(fieldState.error?.message as any)
                    : undefined
                }
                inputProps={{ ...field, maxLength: 50 }}
                label={t("lastName")}
              />
            )}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-5">
          <Label className="text-text-secondary text-sm font-medium">
            {t("contactsInfo")}
          </Label>

          <Controller
            control={control}
            name={UpdateProfileFormField.PhoneNumber}
            render={({ field }) => (
              <PhoneNumberInput
                disabled={true}
                name={field.name}
                onChange={field.onChange}
                success={!!(field.value?.countryCode && field.value?.number)}
                value={field.value || { countryCode: "", number: "" }}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name={UpdateProfileFormField.Email}
          render={({ field, fieldState }) => (
            <FloatingLabelInput
              containerProps={{
                className: "col-span-2",
              }}
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message
                  ? t(fieldState.error?.message as any)
                  : undefined
              }
              inputProps={{
                ...field,
                className: "rtl:text-right",
                dir: "ltr",
                disabled: hasRegisteredEmail,
              }}
              label={t("emailAddress")}
              success={hasRegisteredEmail}
            />
          )}
        />
        <div className="col-span-2 flex flex-col gap-5">
          <Label className="text-text-secondary text-sm font-medium">
            {t("birthday")}
          </Label>
          <Controller
            control={control}
            name={UpdateProfileFormField.DateOfBirth}
            render={({ field, fieldState }) => (
              <DatePickerInput
                containerProps={{
                  className: "col-span-2",
                }}
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message
                    ? t(fieldState.error?.message as any)
                    : undefined
                }
                label={t("birthday")}
                max={dayjs().subtract(1, "year").format("YYYY-MM-DD")}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? ""}
              />
            )}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-5">
          <Label className="text-text-secondary text-sm font-medium">
            {t("gender")}
          </Label>
          <Controller
            control={control}
            name={UpdateProfileFormField.Gender}
            render={({ field, fieldState: { error } }) => {
              const helperText = error?.message;

              return (
                <div className="flex flex-col gap-2">
                  <RadioGroup
                    className="gap-30 flex flex-row"
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {GENDER_OPTIONS.map(({ labelKey, value }) => {
                      const id = `gender-option-${value}`;

                      return (
                        <div className="flex items-center gap-5" key={id}>
                          <RadioGroupItem id={id} value={value} />
                          <Label
                            className="text-text-primary text-xl font-medium"
                            htmlFor={id}
                          >
                            {t(labelKey as any)}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  {helperText && (
                    <p
                      className={cn("text-xs font-normal", {
                        "text-text-danger": !!error,
                      })}
                    >
                      {t(helperText as any)}
                    </p>
                  )}
                </div>
              );
            }}
          />
        </div>
        <FormSubmitButton
          className="col-span-2 mt-20 lg:col-span-1 lg:col-start-2"
          disabled={!isDirty}
          isSubmitting={isSubmitting}
        >
          {isDirty || !isProfileComplete ? t("updateProfile") : t("updated")}
        </FormSubmitButton>
      </form>
    </FormProvider>
  );
};
