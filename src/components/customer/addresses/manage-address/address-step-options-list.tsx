"use client";

import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { useTranslations } from "next-intl";

import { AddressStepOptionSection } from "@/components/customer/addresses/manage-address/address-step-option-section";
import { AddressStepOptionsListSkeleton } from "@/components/customer/addresses/manage-address/address-step-options-list-skeleton";
import { NoInternetFallback } from "@/components/shared/no-internet-fallback";
import { useAddressFormContext } from "@/contexts/address-form-context";
import { useAddressOptionsQuery } from "@/hooks/use-address-options-query";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { trackSelectArea, trackSelectCity } from "@/lib/analytics/events";
import { AddressStepType } from "@/lib/constants/address";
import {
  AddressFormField,
  AddressFormSchemaType,
} from "@/lib/forms/manage-address";
import { isAppOnline } from "@/lib/stores/online-status-store";
import { SelectOption } from "@/lib/types/ui-types";
import { groupByAlphabet } from "@/lib/utils/group-by";
import { isNetworkError } from "@/lib/utils/network-error";

export const AddressStepOptionsList = ({
  searchQuery,
  setSearchQueryAction,
}: {
  searchQuery: string;
  setSearchQueryAction: (value: string) => void;
}) => {
  const t = useTranslations("CustomerAddAddressPage");
  const {
    nextStep,
    selectedStep,
    setHasNavigatedSteps,
    setSkipArea,
    setSkipState,
  } = useAddressFormContext();

  const { control, getValues, setValue } =
    useFormContext<AddressFormSchemaType>();

  const selectedCity = useWatch({
    control,
    name: AddressFormField.City,
  });

  const selectedCountry = useWatch({
    control,
    name: AddressFormField.Country,
  });

  const isOnline = useOnlineStatus();

  const { data, error, fetchStatus, isError, isFetching, isPending, refetch } =
    useAddressOptionsQuery({
      addressType: selectedStep?.type,
      city:
        typeof selectedCity === "string"
          ? selectedCity
          : selectedCity && "value" in selectedCity
            ? selectedCity.value
            : "",
      country:
        typeof selectedCountry === "string"
          ? selectedCountry
          : selectedCountry && "value" in selectedCountry
            ? selectedCountry.value
            : "",
    });

  useEffect(() => {
    if (isPending) return;

    if (
      selectedCity &&
      selectedStep?.type === AddressStepType.Area &&
      data?.length === 0
    ) {
      setSkipArea(true);
    } else {
      setSkipArea(false);
    }
  }, [data?.length, isPending, selectedCity, selectedStep?.type, setSkipArea]);

  useEffect(() => {
    if (isPending) return;

    if (
      selectedCountry &&
      selectedStep?.type === AddressStepType.State &&
      data?.length === 0
    ) {
      setSkipState(true);
    } else {
      setSkipState(false);
    }
  }, [
    data?.length,
    isPending,
    selectedCountry,
    selectedStep?.type,
    setSkipState,
  ]);

  const shouldShowOfflineState =
    !isOnline ||
    fetchStatus === "paused" ||
    (isError && !isFetching && isNetworkError(error));

  const handleRetry = () => {
    if (!isAppOnline()) {
      return;
    }

    refetch();
  };

  const handleSelectOption = (option: SelectOption) => {
    if (selectedStep?.type) {
      if (selectedStep?.type === AddressStepType.Country) {
        setValue(
          AddressFormField.State,
          {
            label: "",
            value: "",
          },
          { shouldDirty: true }
        );
        setValue(AddressFormField.City, "", { shouldDirty: true });
        setValue(AddressFormField.Area, "", { shouldDirty: true });
        setValue(AddressFormField.Street, "", { shouldDirty: true });
        setValue(AddressFormField.BuildingName, "", { shouldDirty: true });
      } else if (selectedStep.type === AddressStepType.City) {
        // Only clear area if the city value is actually changing
        const currentCity = getValues(AddressFormField.City);
        const currentCityValue =
          typeof currentCity === "string"
            ? currentCity
            : currentCity && "value" in currentCity
              ? currentCity.value
              : "";

        if (currentCityValue !== option.value) {
          setValue(
            AddressFormField.Area,
            {
              label: "",
              value: "",
            },
            { shouldDirty: true }
          );
        }
      }
      // Force update even if selecting the same value during edit
      setValue(selectedStep.type as any, option, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      // Track analytics events
      if (selectedStep.type === AddressStepType.Area) {
        trackSelectArea();
      } else if (selectedStep.type === AddressStepType.City) {
        trackSelectCity();
      }
    }
    setSearchQueryAction("");
    nextStep();
    setHasNavigatedSteps(true);
  };

  if (shouldShowOfflineState) {
    return (
      <NoInternetFallback
        className="h-[70dvh]"
        isRetrying={isFetching}
        onRetryAction={handleRetry}
      />
    );
  }

  if (isPending) {
    return <AddressStepOptionsListSkeleton />;
  }

  const topCities =
    selectedStep?.type === AddressStepType.City ? data?.slice(0, 5) || [] : [];

  const filteredTopCities = topCities?.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOptions =
    data?.filter(
      (item) =>
        !topCities.some((top) => top.value === item.value) &&
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const grouped = groupByAlphabet(filteredOptions);
  const sortedKeys = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b, "ar")
  );

  const selectedValue = getValues(selectedStep?.type as any);

  return (
    <>
      <AddressStepOptionSection
        onSelect={handleSelectOption}
        options={filteredTopCities}
        selectedValue={selectedValue}
        title={t("topCities")}
      />
      {sortedKeys.map((letter) => (
        <AddressStepOptionSection
          key={letter}
          onSelect={handleSelectOption}
          options={grouped[letter]}
          selectedValue={selectedValue}
          title={letter}
        />
      ))}
    </>
  );
};
