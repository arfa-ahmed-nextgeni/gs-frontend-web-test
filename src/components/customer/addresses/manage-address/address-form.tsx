"use client";

import React, { useEffect } from "react";
import { Controller, FormProvider } from "react-hook-form";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { CheckedState } from "@radix-ui/react-checkbox";
import { useTranslations } from "next-intl";

import EditIcon from "@/assets/icons/Edit.svg";
import InfoIconYellow from "@/assets/icons/info-icon-yellow.svg";
import { AddressStepSelector } from "@/components/customer/addresses/manage-address/address-step-selector";
import { ControlledPhoneNumberField } from "@/components/form-controlled-fields/controlled-phone-number-field";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextArea } from "@/components/ui/floating-label-textarea";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Label } from "@/components/ui/label";
import { useAddressFormContext } from "@/contexts/address-form-context";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { AddressStepType } from "@/lib/constants/address";
import { StoreCode } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { AddressFormField } from "@/lib/forms/manage-address";

export const AddressForm = () => {
  const t = useTranslations("CustomerAddAddressPage");
  const deliveryAddressT = useTranslations("AddDeliveryAddressPage.steps");
  const formErrorMessages = useTranslations("formErrorMessages");

  const searchParams = useSearchParams();

  const {
    addressForm,
    customerData,
    goToStep,
    handleSubmitForm,
    isEditMode,
    isFirstAddressInCheckout,
    selectedStep,
    steps,
  } = useAddressFormContext();

  const { isGlobal, storeCode } = useStoreCode();
  const isSaudiStore =
    storeCode === StoreCode.ar_sa || storeCode === StoreCode.en_sa;

  const setAsDefaultRequested =
    searchParams.get(QueryParamsKey.SetAsDefault) === "true";

  const {
    control,
    formState: { isSubmitted, isSubmitting, isValid },
    getValues,
    trigger,
    watch,
  } = addressForm;

  const addressLabel = watch(AddressFormField.AddressLabel);
  const isGiftAddress = addressLabel?.toLowerCase() === "gift";
  const buildingName = watch(AddressFormField.BuildingName);
  const isFormDisabled = isSubmitting;

  useEffect(() => {
    if (buildingName !== undefined && buildingName !== "") {
      void trigger(AddressFormField.BuildingName);
    }
  }, [buildingName, trigger]);

  return (
    <FormProvider {...addressForm}>
      <form
        className="flex h-full flex-col bg-[f9f9f9] lg:min-h-0 lg:flex-1"
        onSubmit={handleSubmitForm}
      >
        {selectedStep ? (
          <AddressStepSelector />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col justify-between bg-[#f9f9f9] px-5 py-5">
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto lg:pb-0 lg:pt-2.5">
              <p className="text-text-secondary text-sm font-medium">
                {t("shopperInformation")}
              </p>
              <div className="gap-1.25 flex flex-wrap items-center">
                {steps
                  .map((step, index) => {
                    // For global stores: State step should show State, or City if State not available
                    if (isGlobal && step.type === AddressStepType.State) {
                      const stateField = getValues(
                        AddressFormField.State as any
                      );
                      const cityField = getValues(AddressFormField.City as any);

                      // Handle state value (object with label)
                      const stateValue =
                        typeof stateField === "string"
                          ? stateField
                          : stateField?.label || "";

                      // Handle city value (string for global stores)
                      const cityValue =
                        typeof cityField === "string" ? cityField : "";

                      // Filter out "0", empty strings, and undefined
                      const validStateValue =
                        stateValue && stateValue !== "0" ? stateValue : "";
                      const validCityValue =
                        cityValue && cityValue !== "0" && cityValue !== ""
                          ? cityValue
                          : "";

                      const stepValue = validStateValue || validCityValue;

                      // Return null if both state and city are empty
                      if (!stepValue) {
                        return null;
                      }
                      return { index, step, stepValue };
                    }

                    // For other stores: Area step should only show if it has a valid value
                    if (!isGlobal && step.type === AddressStepType.Area) {
                      const areaField = getValues(AddressFormField.Area as any);
                      const stepValue =
                        typeof areaField === "string"
                          ? areaField
                          : areaField?.label || "";

                      // Filter out "0", empty strings, and undefined
                      if (!stepValue || stepValue === "0") {
                        return null;
                      }
                      return { index, step, stepValue };
                    }

                    // For all other steps (Country, City)
                    const stepField = getValues(step.type as any);
                    const stepValue =
                      typeof stepField === "string"
                        ? stepField
                        : stepField?.label || "";

                    // Filter out "0", empty strings, and undefined
                    if (!stepValue || stepValue === "0") {
                      return null;
                    }
                    return { index, step, stepValue };
                  })
                  .filter(
                    (
                      item
                    ): item is {
                      index: number;
                      step: any;
                      stepValue: string;
                    } => item !== null && !!item.stepValue
                  )
                  .map(({ index, step, stepValue }, filteredIndex) => (
                    <React.Fragment key={step.type}>
                      {filteredIndex > 0 && (
                        <span className="text-text-tertiary text-lg font-normal">
                          /
                        </span>
                      )}
                      <button
                        className="transition-default hover:bg-bg-surface h-12.5 bg-bg-default text-text-tertiary flex items-center justify-center gap-2 rounded-xl px-5 text-lg font-normal"
                        disabled={isFormDisabled}
                        onClick={() => goToStep(index)}
                        type="button"
                      >
                        <span>{stepValue}</span>
                        <Image
                          alt="Edit"
                          className="h-2.5 w-2.5 shrink-0"
                          height={10}
                          src={EditIcon}
                          unoptimized
                          width={10}
                        />
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <div className="col-span-2 mt-5 grid grid-cols-2 gap-x-2.5 gap-y-6">
                <Controller
                  control={control}
                  name={AddressFormField.FirstName}
                  render={({ field, fieldState }) => (
                    <FloatingLabelInput
                      alwaysShowLabel
                      error={!!fieldState.error}
                      helperText={
                        formErrorMessages.has(fieldState.error?.message as any)
                          ? formErrorMessages(fieldState.error?.message as any)
                          : fieldState.error?.message
                      }
                      inputProps={{
                        ...field,
                        disabled: isFormDisabled,
                        maxLength: 50,
                      }}
                      label={t("firstName")}
                    />
                  )}
                />
                {isGlobal && (
                  <Controller
                    control={control}
                    name={AddressFormField.MiddleName}
                    render={({ field, fieldState }) => (
                      <FloatingLabelInput
                        alwaysShowLabel
                        error={!!fieldState.error}
                        helperText={
                          formErrorMessages.has(
                            fieldState.error?.message as any
                          )
                            ? formErrorMessages(
                                fieldState.error?.message as any
                              )
                            : fieldState.error?.message
                        }
                        inputProps={{
                          ...field,
                          disabled: isFormDisabled,
                          maxLength: 50,
                        }}
                        label={t("middleName")}
                      />
                    )}
                  />
                )}
                <Controller
                  control={control}
                  name={AddressFormField.LastName}
                  render={({ field, fieldState }) => (
                    <FloatingLabelInput
                      alwaysShowLabel
                      error={!!fieldState.error}
                      helperText={
                        formErrorMessages.has(fieldState.error?.message as any)
                          ? formErrorMessages(fieldState.error?.message as any)
                          : fieldState.error?.message
                      }
                      inputProps={{
                        ...field,
                        disabled: isFormDisabled,
                        maxLength: 50,
                      }}
                      label={t("lastName")}
                    />
                  )}
                />
                {!isGlobal &&
                  !isGiftAddress &&
                  (customerData === undefined || !customerData?.email) && (
                    <Controller
                      control={control}
                      name={AddressFormField.Email}
                      render={({ field, fieldState }) => {
                        const hasError =
                          (fieldState.isTouched || isSubmitted) &&
                          !!fieldState.error;
                        const errorMessage =
                          hasError && fieldState.error?.message
                            ? formErrorMessages.has(
                                fieldState.error?.message as any
                              )
                              ? formErrorMessages(
                                  fieldState.error?.message as any
                                )
                              : fieldState.error?.message
                            : undefined;

                        return (
                          <FloatingLabelInput
                            alwaysShowLabel
                            containerProps={{
                              className: "col-span-2",
                            }}
                            error={hasError}
                            helperText={errorMessage}
                            inputProps={{
                              ...field,
                              disabled: isFormDisabled,
                            }}
                            label={t("emailAddress")}
                          />
                        );
                      }}
                    />
                  )}
                {isGlobal && (
                  <>
                    <Controller
                      control={control}
                      name={AddressFormField.City}
                      render={({ field, fieldState }) => (
                        <FloatingLabelInput
                          alwaysShowLabel
                          error={!!fieldState.error}
                          helperText={
                            formErrorMessages.has(
                              fieldState.error?.message as any
                            )
                              ? formErrorMessages(
                                  fieldState.error?.message as any
                                )
                              : fieldState.error?.message
                          }
                          inputProps={{
                            ...field,
                            disabled: isFormDisabled,
                            maxLength: 50,
                            value: field.value as string,
                          }}
                          label={t("cityName")}
                        />
                      )}
                    />
                    {(customerData === undefined || !customerData?.email) &&
                      !isGiftAddress && (
                        <Controller
                          control={control}
                          name={AddressFormField.Email}
                          render={({ field, fieldState }) => {
                            const hasError =
                              (fieldState.isTouched || isSubmitted) &&
                              !!fieldState.error;
                            const errorMessage =
                              hasError && fieldState.error?.message
                                ? formErrorMessages.has(
                                    fieldState.error?.message as any
                                  )
                                  ? formErrorMessages(
                                      fieldState.error?.message as any
                                    )
                                  : fieldState.error?.message
                                : undefined;

                            return (
                              <FloatingLabelInput
                                alwaysShowLabel
                                containerProps={{
                                  className: "col-span-2",
                                }}
                                error={hasError}
                                helperText={errorMessage}
                                inputProps={{
                                  ...field,
                                  disabled: isFormDisabled,
                                }}
                                label={t("emailAddress")}
                              />
                            );
                          }}
                        />
                      )}
                    <Controller
                      control={control}
                      name={AddressFormField.Area}
                      render={({ field, fieldState }) => (
                        <FloatingLabelInput
                          alwaysShowLabel
                          containerProps={{
                            className: "col-span-2",
                          }}
                          error={!!fieldState.error}
                          helperText={
                            formErrorMessages.has(
                              fieldState.error?.message as any
                            )
                              ? formErrorMessages(
                                  fieldState.error?.message as any
                                )
                              : fieldState.error?.message
                          }
                          inputProps={{
                            ...field,
                            disabled: isFormDisabled,
                            maxLength: 50,
                            value: field.value as string,
                          }}
                          label={t("areaName")}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={AddressFormField.Street}
                      render={({ field, fieldState }) => (
                        <FloatingLabelInput
                          alwaysShowLabel
                          containerProps={{
                            className: "col-span-2",
                          }}
                          error={!!fieldState.error}
                          helperText={
                            formErrorMessages.has(
                              fieldState.error?.message as any
                            )
                              ? formErrorMessages(
                                  fieldState.error?.message as any
                                )
                              : fieldState.error?.message
                          }
                          inputProps={{ ...field, disabled: isFormDisabled }}
                          label={t("street")}
                        />
                      )}
                    />
                  </>
                )}
                <Controller
                  control={control}
                  name={AddressFormField.BuildingName}
                  render={({ field, fieldState }) =>
                    isGlobal ? (
                      <FloatingLabelInput
                        alwaysShowLabel
                        containerProps={{
                          className: "col-span-2",
                        }}
                        error={!!fieldState.error}
                        helperText={
                          formErrorMessages.has(
                            fieldState.error?.message as any
                          )
                            ? formErrorMessages(
                                fieldState.error?.message as any
                              )
                            : fieldState.error?.message
                        }
                        inputProps={{ ...field, disabled: isFormDisabled }}
                        label={t("additionalInfo")}
                      />
                    ) : (
                      <FloatingLabelTextArea
                        containerProps={{
                          className: "col-span-2",
                        }}
                        error={!!fieldState.error}
                        helperText={
                          formErrorMessages.has(
                            fieldState.error?.message as any
                          )
                            ? formErrorMessages(
                                fieldState.error?.message as any
                              )
                            : fieldState.error?.message
                        }
                        label={t("additionalInfo")}
                        textareaProps={{
                          ...field,
                          disabled: isFormDisabled,
                          onChange: (e) => {
                            field.onChange(e);
                            void trigger(AddressFormField.BuildingName);
                          },
                          rows: 4,
                        }}
                      />
                    )
                  }
                />
                {isSaudiStore && (
                  <div className="col-span-2">
                    <Controller
                      control={control}
                      name={AddressFormField.KsaShortAddress}
                      render={({ field, fieldState }) => (
                        <>
                          <FloatingLabelInput
                            alwaysShowLabel
                            error={!!fieldState.error}
                            helperText={
                              formErrorMessages.has(
                                fieldState.error?.message as any
                              )
                                ? formErrorMessages(
                                    fieldState.error?.message as any
                                  )
                                : fieldState.error?.message
                            }
                            inputProps={{ ...field, disabled: isFormDisabled }}
                            label={deliveryAddressT("shortNationalAddress")}
                          />
                          <div className="mt-[-5px] flex items-center gap-2 rounded-b-lg bg-amber-50 px-3 py-2">
                            <Image
                              alt="Info"
                              className="size-5 flex-shrink-0"
                              height={10}
                              src={InfoIconYellow}
                              width={10}
                            />
                            <p className="text-xs" style={{ color: "#FFA500" }}>
                              {deliveryAddressT(
                                "incorrectNationalAddressWarning"
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    />
                  </div>
                )}
                {isGlobal && (
                  <Controller
                    control={control}
                    name={AddressFormField.PostalCode}
                    render={({ field, fieldState }) => (
                      <FloatingLabelInput
                        alwaysShowLabel
                        containerProps={{
                          className: "col-span-2",
                        }}
                        error={!!fieldState.error}
                        helperText={
                          formErrorMessages.has(
                            fieldState.error?.message as any
                          )
                            ? formErrorMessages(
                                fieldState.error?.message as any
                              )
                            : fieldState.error?.message
                        }
                        inputProps={{ ...field, disabled: isFormDisabled }}
                        label={t("postalCode")}
                      />
                    )}
                  />
                )}
                <div className="col-span-2">
                  <Controller
                    control={control}
                    name={AddressFormField.PhoneNumber}
                    render={({ field }) => (
                      <ControlledPhoneNumberField
                        disabled={!isGiftAddress || isFormDisabled}
                        floatingLabelInputProps={{
                          label: isGiftAddress
                            ? t("receiverPhoneNumber")
                            : t("mobileNumber"),
                        }}
                        name={field.name}
                        showVerifyIcon={!isGiftAddress}
                      />
                    )}
                  />
                </div>
                {!isEditMode &&
                  isGiftAddress &&
                  !customerData?.firstName &&
                  !customerData?.lastName && (
                    <>
                      <div className="col-span-2">
                        <Label className="text-text-secondary text-sm font-medium">
                          {t("senderInformation")}
                        </Label>
                      </div>
                      <Controller
                        control={control}
                        name={AddressFormField.SenderFirstName}
                        render={({ field, fieldState }) => (
                          <FloatingLabelInput
                            alwaysShowLabel
                            error={!!fieldState.error}
                            helperText={
                              formErrorMessages.has(
                                fieldState.error?.message as any
                              )
                                ? formErrorMessages(
                                    fieldState.error?.message as any
                                  )
                                : fieldState.error?.message
                            }
                            inputProps={{
                              ...field,
                              autoComplete: "off",
                              disabled: isFormDisabled,
                              maxLength: 50,
                            }}
                            label={t("firstName")}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={AddressFormField.SenderLastName}
                        render={({ field, fieldState }) => (
                          <FloatingLabelInput
                            alwaysShowLabel
                            error={!!fieldState.error}
                            helperText={
                              formErrorMessages.has(
                                fieldState.error?.message as any
                              )
                                ? formErrorMessages(
                                    fieldState.error?.message as any
                                  )
                                : fieldState.error?.message
                            }
                            inputProps={{
                              ...field,
                              autoComplete: "off",
                              disabled: isFormDisabled,
                              maxLength: 50,
                            }}
                            label={t("lastName")}
                          />
                        )}
                      />
                    </>
                  )}
              </div>
            </div>
            <div className="flex flex-col gap-6 pt-5 lg:shrink-0 lg:pb-5">
              {!isGiftAddress && (
                <Controller
                  control={control}
                  name={AddressFormField.SaveAsDefault}
                  render={({ field }) => (
                    <div className="transition-default flex transform items-center gap-2.5 py-1.5">
                      <Checkbox
                        checked={field.value as CheckedState}
                        className="peer size-4"
                        disabled={
                          isFormDisabled ||
                          setAsDefaultRequested ||
                          (!isEditMode && isFirstAddressInCheckout)
                        }
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
                        {t("setAsDefaultAddress")}
                      </Label>
                    </div>
                  )}
                />
              )}
              <FormSubmitButton
                disabled={!isValid || isSubmitting}
                isSubmitting={isSubmitting}
              >
                {t(isEditMode ? "saveChanges" : "addAddress")}
              </FormSubmitButton>
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
};
