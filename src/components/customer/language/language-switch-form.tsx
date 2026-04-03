"use client";

import { Controller } from "react-hook-form";

import Image from "next/image";

import { useTranslations } from "next-intl";

import { useLanguageSwitchForm } from "@/components/customer/language/hooks/use-language-switch-form";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LANGUAGE_SWITCH_OPTIONS } from "@/lib/constants/i18n";
import { LanguageSwitchFormField } from "@/lib/forms/language-switch";
import { cn } from "@/lib/utils";

export const LanguageSwitchForm = () => {
  const t = useTranslations("LanguagePage");

  const {
    handleSubmitForm,
    isNavigating,
    languageSwitchForm: {
      control,
      formState: { isDirty, isSubmitting },
    },
  } = useLanguageSwitchForm();

  return (
    <form className="mt-7.5 flex flex-col" onSubmit={handleSubmitForm}>
      <div className="flex flex-col gap-5">
        <Label className="text-text-secondary px-5 text-sm font-medium">
          {t("languages")}
        </Label>
        <Controller
          control={control}
          name={LanguageSwitchFormField.Language}
          render={({ field }) => {
            return (
              <RadioGroup
                className="flex flex-col gap-0"
                onValueChange={field.onChange}
                value={field.value}
              >
                {LANGUAGE_SWITCH_OPTIONS.map(({ className, icon, value }) => (
                  <div
                    className="h-12.5 bg-bg-default border-border-base flex items-center justify-between border-b px-5"
                    key={value}
                  >
                    <Label
                      className="transition-default text-text-primary flex flex-1 flex-row gap-5 text-xl font-normal"
                      htmlFor={value}
                    >
                      <Image
                        alt=""
                        height={20}
                        src={icon}
                        unoptimized
                        width={26}
                      />
                      <p className={cn("text-xl font-medium", className)}>
                        {t(`languageNames.${value}`)}
                      </p>
                    </Label>
                    <RadioGroupItem id={value} value={value} />
                  </div>
                ))}
              </RadioGroup>
            );
          }}
        />
      </div>
      <div className="absolute bottom-5 w-full px-5 lg:static lg:mt-10">
        <FormSubmitButton
          className="w-full"
          disabled={!isDirty}
          isSubmitting={isSubmitting || isNavigating}
        >
          {t("confirm")}
        </FormSubmitButton>
      </div>
    </form>
  );
};
