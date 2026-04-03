"use client";

import { Controller } from "react-hook-form";

import Image from "next/image";

import { useTranslations } from "next-intl";

import { useRegionSwitchForm } from "@/components/customer/region/hooks/use-region-switch-form";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { COUNTRY_CODE_TO_FLAG } from "@/lib/constants/i18n";
import { RegionSwitchFormField } from "@/lib/forms/region-switch";
import { LocaleSwitchOption } from "@/lib/types/store-config";

export const RegionSwitchForm = ({
  localeSwitchOptions,
}: {
  localeSwitchOptions: LocaleSwitchOption[];
}) => {
  const t = useTranslations("RegionPage");

  const {
    handleSubmitForm,
    isNavigating,
    regionSwitchForm: {
      control,
      formState: { isDirty, isSubmitting },
    },
  } = useRegionSwitchForm({ localeSwitchOptions });

  return (
    <form className="mt-7.5 flex flex-col" onSubmit={handleSubmitForm}>
      <div className="flex flex-col gap-5">
        <Label className="text-text-secondary px-5 text-sm font-medium">
          {t("countries")}
        </Label>
        <Controller
          control={control}
          name={RegionSwitchFormField.Country}
          render={({ field }) => {
            return (
              <RadioGroup
                className="flex flex-col gap-0"
                onValueChange={field.onChange}
                value={field.value}
              >
                {localeSwitchOptions.map(({ code }) => (
                  <div
                    className="h-12.5 bg-bg-default border-border-base flex items-center justify-between border-b px-5"
                    key={code}
                  >
                    <Label
                      className="transition-default text-text-primary flex flex-1 flex-row gap-5 text-xl font-normal"
                      htmlFor={code}
                    >
                      <Image
                        alt=""
                        height={20}
                        src={COUNTRY_CODE_TO_FLAG[code]}
                        unoptimized
                        width={26}
                      />
                      <p className="text-xl font-medium">
                        {t(`countryNames.${code}`)}
                      </p>
                    </Label>
                    <RadioGroupItem id={code} value={code} />
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
