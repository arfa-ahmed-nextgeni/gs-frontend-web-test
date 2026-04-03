"use client";

import { useMemo } from "react";
import { Controller, FormProvider } from "react-hook-form";

import Image from "next/image";

import { useTranslations } from "next-intl";

import { useAddPickupPointAddressForm } from "@/components/checkout/add-pickup-point/hooks/use-add-pickup-point-address-form";
import { useScrollToTop } from "@/components/checkout/add-pickup-point/hooks/use-scroll-to-top";
import { ControlledPhoneNumberField } from "@/components/form-controlled-fields/controlled-phone-number-field";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import { useLockerLocations } from "@/hooks/queries/use-locker-locations";
import {
  LOCKER_ICONS,
  LockerType,
} from "@/lib/constants/checkout/locker-locations";
import { AddPickupPointAddressFormField } from "@/lib/forms/add-pickup-point-address";

export const AddPickupPointAddressForm = () => {
  const formErrorMessages = useTranslations("formErrorMessages");
  const t = useTranslations("AddPickupPointPage");

  const { currentLocation, customerData, lockerType, selectedLockerId } =
    useAddPickupPointContext();

  const { data: lockerLocations = [] } = useLockerLocations(
    currentLocation
      ? {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          type: lockerType,
        }
      : null
  );

  const selectedLocker = useMemo(() => {
    if (!selectedLockerId) {
      return null;
    }

    return (
      lockerLocations.find((locker) => locker.id === selectedLockerId) || null
    );
  }, [lockerLocations, selectedLockerId]);

  const { addPickupPointAddressForm, handleSubmitForm } =
    useAddPickupPointAddressForm();
  const { currentStep } = useAddPickupPointContext();
  const scrollContainerRef = useScrollToTop(currentStep);

  const {
    control,
    formState: { isSubmitting, isValid },
  } = addPickupPointAddressForm;

  return (
    <FormProvider {...addPickupPointAddressForm}>
      <form className="flex h-full flex-col" onSubmit={handleSubmitForm}>
        <div
          className="lg:gap-7.5 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 md:gap-6"
          ref={scrollContainerRef}
        >
          <div className="flex flex-col gap-2.5">
            <p className="text-text-secondary text-sm font-medium">
              {lockerType === LockerType.Fodel
                ? t("selectPickUpLocation")
                : t("lockerLocations")}
            </p>
            <div className="bg-bg-default min-h-11.25 flex items-center gap-5 rounded-xl px-5 py-1">
              <Image
                alt="Locker icon"
                className="size-6.25"
                height={25}
                src={LOCKER_ICONS[lockerType].icon}
                width={25}
              />
              <p className="text-text-primary flex-1 text-sm font-medium">
                {selectedLocker?.name}
              </p>
              <p className="text-text-tertiary text-xs font-normal">
                {selectedLocker?.pointName}
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-2.5">
            <Controller
              control={control}
              name={AddPickupPointAddressFormField.FirstName}
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
              name={AddPickupPointAddressFormField.LastName}
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
          </div>

          <Controller
            control={control}
            name={AddPickupPointAddressFormField.PhoneNumber}
            render={({ field }) => (
              <ControlledPhoneNumberField
                floatingLabelInputProps={{
                  label: t("mobileNumber.label"),
                }}
                name={field.name}
              />
            )}
          />

          {!customerData?.email && (
            <Controller
              control={control}
              name={AddPickupPointAddressFormField.Email}
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
                  }}
                  label={t("email.label")}
                />
              )}
            />
          )}
        </div>

        <div className="border-border-base bg-bg-default flex-shrink-0 border-t px-5 pb-5 pt-2.5 lg:pb-2.5">
          <FormSubmitButton
            className="w-full"
            disabled={!isValid}
            isSubmitting={isSubmitting}
          >
            {t("submitButton")}
          </FormSubmitButton>
        </div>
      </form>
    </FormProvider>
  );
};
