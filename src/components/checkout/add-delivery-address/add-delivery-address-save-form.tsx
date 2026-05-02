"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import Image from "next/image";

import { useTranslations } from "next-intl";

import EditIcon from "@/assets/icons/edit-icon.svg";
import InfoIconYellow from "@/assets/icons/info-icon-yellow.svg";
import KSALogo from "@/assets/logos/ksa-na-logo.svg";
import { ControlledPhoneNumberField } from "@/components/form-controlled-fields/controlled-phone-number-field";
import { useToastContext } from "@/components/providers/toast-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { useOptionalCheckoutContext } from "@/contexts/checkout-context";
import { useKsaAddressQuery } from "@/hooks/queries/use-ksa-address";
import { useAddressOptionsQuery } from "@/hooks/use-address-options-query";
import { addDeliveryAddress } from "@/lib/actions/checkout/add-delivery-address";
import { updateCustomerAddress } from "@/lib/actions/customer/update-customer-address";
import { updateProfileFromAddress } from "@/lib/actions/customer/update-profile";
import { trackProfileUpdated } from "@/lib/analytics/events";
import { AddressStepType } from "@/lib/constants/address";
import {
  CHECKOUT_ADDRESS_SAVED_EVENT,
  CHECKOUT_ADDRESS_SAVED_FLAG,
} from "@/lib/constants/checkout/events";
import { AddressFormField } from "@/lib/forms/manage-address";
import { cn } from "@/lib/utils";
import { isValidPhoneNumber } from "@/lib/utils/country";
import {
  emptyGoogleAddressData,
  sanitizeStreetValue,
} from "@/lib/utils/google-address";
import { isError, isOk } from "@/lib/utils/service-result";

import type { CustomerAddress } from "@/graphql/graphql";
import type { AddressFormSchemaType } from "@/lib/forms/manage-address";
import type { ServiceResult } from "@/lib/types/service-result";

// Helper to ensure phone number has +966 prefix
const ensureSaudiPhonePrefix = (phoneNumber: string): string => {
  if (!phoneNumber) return "+966";
  if (phoneNumber.startsWith("+966")) return phoneNumber;
  if (phoneNumber.startsWith("966")) return "+" + phoneNumber;
  if (phoneNumber.startsWith("0")) return "+966" + phoneNumber.slice(1);
  return "+966" + phoneNumber;
};

export const AddDeliveryAddressSaveForm = () => {
  const t = useTranslations("AddDeliveryAddressPage.steps");
  const tCommonErrors = useTranslations("CommonErrors");
  const tValidationErrors = useTranslations(
    "AddDeliveryAddressPage.validationErrors"
  );
  const [isCityFocused, setIsCityFocused] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState<null | string>(null);
  const [selectedCityForDistricts, setSelectedCityForDistricts] = useState("");
  const [senderFirstName, setSenderFirstName] = useState("");
  const [senderLastName, setSenderLastName] = useState("");

  const {
    customerData,
    deliveryType,
    editingAddressId,
    googleAddressData,
    initialAddressSnapshot,
    initialContactData,
    initialSelectedLocation,
    isFirstAddressInCheckout,
    isManualEntryMode,
    selectedAddress,
    selectedLocation,
    setGoogleAddressData,
    setIsManualEntryMode,
    setKsaAddress,
    setSelectedAddress,
    setSelectedLocation,
    setShowSaveForm,
  } = useAddDeliveryAddressContext();
  // Optional checkout context - safe to access if available
  const checkoutContext = useOptionalCheckoutContext();
  const { showError } = useToastContext();
  const isGiftDelivery = deliveryType === "gift_delivery";
  const initialFirstName = isGiftDelivery
    ? (initialContactData?.firstName ?? "")
    : (customerData?.firstName ?? "");
  const initialLastName = isGiftDelivery
    ? (initialContactData?.lastName ?? "")
    : (customerData?.lastName ?? "");
  const initialPhoneNumber = isGiftDelivery
    ? ensureSaudiPhonePrefix(initialContactData?.phoneNumber ?? "")
    : ensureSaudiPhonePrefix(
        initialContactData?.phoneNumber ?? customerData?.phoneNumber ?? ""
      );
  const phoneForm = useForm({
    defaultValues: {
      phone: {
        countryCode: "+966",
        number: initialPhoneNumber.startsWith("+966")
          ? initialPhoneNumber.slice(4)
          : initialPhoneNumber,
      },
    },
  });
  const phoneWatch = phoneForm.watch("phone");
  const shouldVerifyCoordinates = useMemo(() => {
    if (!selectedLocation) {
      return false;
    }

    if (!editingAddressId || !initialSelectedLocation) {
      return true;
    }

    return (
      selectedLocation.lat !== initialSelectedLocation.lat ||
      selectedLocation.lng !== initialSelectedLocation.lng
    );
  }, [editingAddressId, initialSelectedLocation, selectedLocation]);
  const { data: queriedKsaAddress, isPending: isLoadingKsa } =
    useKsaAddressQuery({
      enabled: shouldVerifyCoordinates,
      latitude: selectedLocation?.lat,
      longitude: selectedLocation?.lng,
    });
  const showKsaValidationLoader = shouldVerifyCoordinates && isLoadingKsa;
  const shouldUseSavedAddress =
    !!editingAddressId && !!initialSelectedLocation && !shouldVerifyCoordinates;

  useEffect(() => {
    // Mirror the cached KSA lookup into context so the manual form can reuse it.
    setKsaAddress(queriedKsaAddress ?? null);
  }, [queriedKsaAddress, setKsaAddress]);

  const fallbackAddressData = googleAddressData || emptyGoogleAddressData();
  // Prefer the cached KSA validation data, then fall back to Google-derived fields.
  const ksaAddress = queriedKsaAddress ?? null;

  // Build address data: prefer KSA data, fallback to Google reverse geocoding
  const addressData = useMemo(
    () => ({
      city:
        (shouldUseSavedAddress
          ? initialAddressSnapshot?.city
          : ksaAddress?.city || fallbackAddressData.city) || "",
      district:
        (shouldUseSavedAddress
          ? initialAddressSnapshot?.district
          : ksaAddress?.district || fallbackAddressData.district) || "",
      postalCode:
        (shouldUseSavedAddress
          ? initialAddressSnapshot?.postalCode
          : ksaAddress?.postCode || fallbackAddressData.postalCode) || "",
      shortCode:
        (shouldUseSavedAddress
          ? initialAddressSnapshot?.shortCode
          : ksaAddress?.short_address || fallbackAddressData.shortCode) || "",
      street: sanitizeStreetValue({
        district: shouldUseSavedAddress
          ? initialAddressSnapshot?.district || ""
          : ksaAddress?.district || fallbackAddressData.district,
        shortCode: shouldUseSavedAddress
          ? initialAddressSnapshot?.shortCode || ""
          : ksaAddress?.short_address || fallbackAddressData.shortCode,
        street:
          (shouldUseSavedAddress
            ? initialAddressSnapshot?.street
            : ksaAddress?.address1 ||
              ksaAddress?.street ||
              fallbackAddressData.street ||
              selectedAddress) || "",
      }),
    }),
    [
      fallbackAddressData,
      initialAddressSnapshot,
      ksaAddress,
      selectedAddress,
      shouldUseSavedAddress,
    ]
  );
  const displayedAddress =
    shouldUseSavedAddress && initialAddressSnapshot?.formattedAddress
      ? initialAddressSnapshot.formattedAddress
      : selectedAddress;

  const [formData, setFormData] = useState({
    buildingName: "",
    city: "",
    district: "",
    firstName: initialFirstName,
    lastName: initialLastName,
    phoneNumber: initialPhoneNumber,
    setAsDefault: editingAddressId
      ? !!initialAddressSnapshot?.isDefault
      : !isGiftDelivery,
    shortNationalAddress: "",
  });

  const touchedFieldsRef = useRef<
    Partial<
      Record<
        "buildingName" | "city" | "district" | "shortNationalAddress",
        boolean
      >
    >
  >({});
  const lastAutofillRef = useRef({
    buildingName: "",
    city: "",
    district: "",
    shortNationalAddress: "",
  });

  useEffect(() => {
    if (!isGiftDelivery) return;
    const number = phoneWatch.number?.trim() ?? "";
    if (!number) {
      setPhoneNumberError(null);
    } else if (!isValidPhoneNumber(number, "SA", undefined, true)) {
      setPhoneNumberError(tValidationErrors("invalidPhoneNumber"));
    } else {
      setPhoneNumberError(null);
    }
  }, [phoneWatch.number, isGiftDelivery, tValidationErrors]);

  // Apply reverse-geocode fallback first, then replace with KSA data when it arrives,
  // without overwriting fields the user already edited.
  useEffect(() => {
    const nextAutofill = {
      buildingName: addressData.street,
      city: addressData.city,
      district: addressData.district,
      shortNationalAddress: addressData.shortCode,
    };

    setFormData((prev) => ({
      ...prev,
      buildingName:
        !touchedFieldsRef.current.buildingName ||
        prev.buildingName === lastAutofillRef.current.buildingName
          ? nextAutofill.buildingName || prev.buildingName
          : prev.buildingName,
      city:
        !touchedFieldsRef.current.city ||
        prev.city === lastAutofillRef.current.city
          ? nextAutofill.city || prev.city
          : prev.city,
      district:
        !touchedFieldsRef.current.district ||
        prev.district === lastAutofillRef.current.district
          ? nextAutofill.district || prev.district
          : prev.district,
      shortNationalAddress:
        !touchedFieldsRef.current.shortNationalAddress ||
        prev.shortNationalAddress ===
          lastAutofillRef.current.shortNationalAddress
          ? nextAutofill.shortNationalAddress || prev.shortNationalAddress
          : prev.shortNationalAddress,
    }));

    lastAutofillRef.current = nextAutofill;
  }, [addressData]);

  // Fetch cities
  const { data: citiesData, isPending: citiesLoading } = useAddressOptionsQuery(
    {
      addressType: AddressStepType.City,
      city: "",
      country: "SA", // Default to Saudi Arabia for now
    }
  );

  // Fetch districts/areas based on selected city
  const { data: districtsData, isPending: districtsLoading } =
    useAddressOptionsQuery({
      addressType: AddressStepType.Area,
      city: selectedCityForDistricts,
      country: "SA",
    });

  const filteredCities = (citiesData || []).filter((city) =>
    city?.label?.toLowerCase().includes((formData.city || "").toLowerCase())
  );

  const normalizedCityInput = formData.city.trim().toLowerCase();
  const hasMatchingCity = (citiesData || []).some(
    (city) =>
      city?.label?.trim().toLowerCase() === normalizedCityInput ||
      city?.value?.trim().toLowerCase() === normalizedCityInput
  );
  const showNoMatchingCity =
    !!normalizedCityInput && !citiesLoading && !hasMatchingCity;
  const showCityNoMatchDropdown =
    showNoMatchingCity && !isCityFocused && !showCitySuggestions;

  useEffect(() => {
    const normalizedCityInput = formData.city.trim().toLowerCase();

    if (!normalizedCityInput) {
      setSelectedCityForDistricts("");
      return;
    }

    const matchingCity = (citiesData || []).find(
      (city) =>
        city?.label?.trim().toLowerCase() === normalizedCityInput ||
        city?.value?.trim().toLowerCase() === normalizedCityInput
    );

    // Only unlock district fetching after the city matches a real option.
    setSelectedCityForDistricts(matchingCity?.label || "");
  }, [citiesData, formData.city]);

  const filteredDistricts = (districtsData || []).filter((district) =>
    district?.label
      ?.toLowerCase()
      .includes((formData.district || "").toLowerCase())
  );

  const handleInputChange = (field: string, value: boolean | string) => {
    if (
      field === "buildingName" ||
      field === "city" ||
      field === "district" ||
      field === "shortNationalAddress"
    ) {
      touchedFieldsRef.current[field] = true;
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // If city is cleared, clear only address-related fields
      if (field === "city" && value === "") {
        updated.district = "";
        updated.buildingName = "";
        updated.shortNationalAddress = "";
      }

      return updated;
    });
    if (field === "city") {
      setShowCitySuggestions(true);
    }
    if (field === "district") {
      setShowDistrictSuggestions(true);
    }
  };

  const handleSelectCity = (cityLabel: string) => {
    setFormData((prev) => ({
      ...prev,
      city: cityLabel,
      district: "", // Reset district when city changes
    }));
    setSelectedCityForDistricts(cityLabel);
    setShowCitySuggestions(false);
  };

  const handleSelectDistrict = (districtLabel: string) => {
    setFormData((prev) => ({
      ...prev,
      district: districtLabel,
    }));
    setShowDistrictSuggestions(false);
  };

  const isConfirmDisabled =
    isPending ||
    showKsaValidationLoader ||
    !selectedLocation ||
    !formData.city.trim() ||
    showNoMatchingCity ||
    !formData.firstName.trim() ||
    !formData.lastName.trim() ||
    (!isGiftDelivery && !phoneWatch.number?.trim()) ||
    (isGiftDelivery && (!phoneWatch.number?.trim() || !!phoneNumberError));

  const handleConfirmAddress = async () => {
    if (isConfirmDisabled) {
      return;
    }

    setIsPending(true);

    try {
      // Build profile update payload if customer is missing name data
      const profilePayload: Record<string, string> = {};

      if (isGiftDelivery) {
        // For gift delivery, use sender name to update profile if missing
        if (!customerData?.firstName && senderFirstName?.trim()) {
          profilePayload.firstName = senderFirstName.trim();
        }
        if (!customerData?.lastName && senderLastName?.trim()) {
          profilePayload.lastName = senderLastName.trim();
        }
      } else {
        // For home delivery, use recipient name to update profile if missing
        if (!customerData?.firstName && formData.firstName?.trim()) {
          profilePayload.firstName = formData.firstName.trim();
        }
        if (!customerData?.lastName && formData.lastName?.trim()) {
          profilePayload.lastName = formData.lastName.trim();
        }
      }

      // Update profile if there's data to update
      if (Object.keys(profilePayload).length > 0) {
        const profileResult = await updateProfileFromAddress(profilePayload);

        if (isError(profileResult)) {
          showError(profileResult.error, " ");
          setIsPending(false);
          return;
        }

        // Track profile_updated when user's profile updated from address form
        if (isOk(profileResult)) {
          trackProfileUpdated();
        }
      }

      // Call the server action to save the address
      let result: ServiceResult<CustomerAddress> | ServiceResult<string>;

      if (editingAddressId) {
        // Update existing address using the address form schema
        const updateData: AddressFormSchemaType = {
          [AddressFormField.AddressLabel]:
            deliveryType === "gift_delivery" ? "gift" : "home",
          [AddressFormField.Area]: {
            label: formData.district,
            value: formData.district,
          },
          [AddressFormField.BuildingName]: formData.buildingName,
          [AddressFormField.City]: {
            label: formData.city,
            value: formData.city,
          },
          [AddressFormField.Country]: {
            label: "Saudi Arabia",
            value: "SA",
          },
          [AddressFormField.Email]: "",
          [AddressFormField.FirstName]: formData.firstName,
          [AddressFormField.KsaAdditionalNumber]:
            queriedKsaAddress?.additionalNumber || "",
          [AddressFormField.KsaBuildingNumber]:
            queriedKsaAddress?.buildingNumber || "",
          [AddressFormField.KsaShortAddress]: formData.shortNationalAddress,
          [AddressFormField.LastName]: formData.lastName,
          [AddressFormField.Latitude]: isManualEntryMode
            ? ""
            : `${selectedLocation.lat}`,
          [AddressFormField.Longitude]: isManualEntryMode
            ? ""
            : `${selectedLocation.lng}`,
          [AddressFormField.MiddleName]: "",
          [AddressFormField.PhoneNumber]: {
            countryCode: phoneForm.getValues("phone").countryCode ?? "+966",
            number: phoneForm.getValues("phone").number ?? "",
          },
          [AddressFormField.PostalCode]: addressData.postalCode,
          [AddressFormField.SaveAsDefault]: formData.setAsDefault,
          [AddressFormField.SenderFirstName]: "",
          [AddressFormField.SenderLastName]: "",
          [AddressFormField.State]: {
            label: "",
            value: "",
          },
          [AddressFormField.Street]: formData.buildingName,
        };

        result = await updateCustomerAddress({
          data: updateData,
          id: Number(editingAddressId),
        });
      } else {
        // Create new address
        result = await addDeliveryAddress({
          addressLabel: deliveryType === "gift_delivery" ? "gift" : "home",
          city: formData.city,
          district: formData.district,
          firstName: formData.firstName,
          ksaShortAddress: formData.shortNationalAddress,
          lastName: formData.lastName,
          latitude: isManualEntryMode ? undefined : selectedLocation.lat,
          longitude: isManualEntryMode ? undefined : selectedLocation.lng,
          phoneNumber:
            (phoneForm.getValues("phone").countryCode ?? "+966") +
            (phoneForm.getValues("phone").number ?? ""),
          postalCode: addressData.postalCode,
          setAsDefault: formData.setAsDefault,
          street: formData.buildingName,
        });
      }

      if (editingAddressId) {
        const updateResult = result as ServiceResult<string>;
        if (isError(updateResult)) {
          console.error("[SaveForm] Error saving address:", {
            error: updateResult.error,
            result: updateResult,
            status: updateResult.status,
          });
          showError(updateResult.error, " ");
        } else if (isOk(updateResult)) {
          console.info("[SaveForm] Address updated successfully");
          const savedAddressPayload = JSON.stringify({
            addressId: editingAddressId,
            mode: "update",
            type: deliveryType,
          });
          window.sessionStorage.setItem(
            CHECKOUT_ADDRESS_SAVED_FLAG,
            savedAddressPayload
          );
          window.dispatchEvent(
            new CustomEvent(CHECKOUT_ADDRESS_SAVED_EVENT, {
              detail: {
                addressId: editingAddressId,
                mode: "update",
                type: deliveryType,
              },
            })
          );

          // Clear form and map data before navigating back
          setFormData({
            buildingName: "",
            city: "",
            district: "",
            firstName: initialFirstName,
            lastName: initialLastName,
            phoneNumber: initialPhoneNumber,
            setAsDefault: editingAddressId
              ? !!initialAddressSnapshot?.isDefault
              : !isGiftDelivery,
            shortNationalAddress: "",
          });
          phoneForm.reset({
            phone: {
              countryCode: "+966",
              number: initialPhoneNumber.startsWith("+966")
                ? initialPhoneNumber.slice(4)
                : initialPhoneNumber,
            },
          });
          setSenderFirstName("");
          setSenderLastName("");
          setShowCitySuggestions(false);
          setShowDistrictSuggestions(false);
          setIsCityFocused(false);
          setSelectedLocation(null);
          setSelectedAddress(null);
          setGoogleAddressData(null);
          setKsaAddress(null);
          touchedFieldsRef.current = {};
          lastAutofillRef.current = {
            buildingName: "",
            city: "",
            district: "",
            shortNationalAddress: "",
          };

          // Close the save form first
          setShowSaveForm(false);

          // Ensure shipping option drawer is closed on mobile (if within CheckoutProvider)
          checkoutContext?.setDeliveryAddressFlowState(null);
          checkoutContext?.setIsShippingOptionDrawerOpen(false);

          // Small delay to ensure event is processed before navigation (especially on mobile)
          setTimeout(() => {
            window.history.back();
          }, 100);
        }
      } else {
        const createResult = result as ServiceResult<CustomerAddress>;
        if (isError(createResult)) {
          console.error("[SaveForm] Error saving address:", createResult.error);
          showError(createResult.error, " ");
        } else if (isOk(createResult)) {
          // Type guard: only log CustomerAddress properties for create operations
          const isCustomerAddress =
            createResult.data &&
            typeof createResult.data === "object" &&
            "is_ksa_verified" in createResult.data;
          console.info("[SaveForm] Address saved successfully:", {
            createCustomerAddress: isCustomerAddress
              ? createResult.data
              : undefined,
            isKsaVerified: isCustomerAddress
              ? (createResult.data as any).is_ksa_verified
              : undefined,
          });
          const savedAddressPayload = JSON.stringify({
            addressId: createResult.data?.id,
            mode: "create",
            type: deliveryType,
          });
          window.sessionStorage.setItem(
            CHECKOUT_ADDRESS_SAVED_FLAG,
            savedAddressPayload
          );
          window.dispatchEvent(
            new CustomEvent(CHECKOUT_ADDRESS_SAVED_EVENT, {
              detail: {
                addressId: createResult.data?.id,
                mode: "create",
                type: deliveryType,
              },
            })
          );

          // Clear form and map data before navigating back
          setFormData({
            buildingName: "",
            city: "",
            district: "",
            firstName: initialFirstName,
            lastName: initialLastName,
            phoneNumber: initialPhoneNumber,
            setAsDefault: editingAddressId
              ? !!initialAddressSnapshot?.isDefault
              : !isGiftDelivery,
            shortNationalAddress: "",
          });
          phoneForm.reset({
            phone: {
              countryCode: "+966",
              number: initialPhoneNumber.startsWith("+966")
                ? initialPhoneNumber.slice(4)
                : initialPhoneNumber,
            },
          });
          setSenderFirstName("");
          setSenderLastName("");
          setShowCitySuggestions(false);
          setShowDistrictSuggestions(false);
          setIsCityFocused(false);
          setSelectedLocation(null);
          setSelectedAddress(null);
          setGoogleAddressData(null);
          setKsaAddress(null);
          touchedFieldsRef.current = {};
          lastAutofillRef.current = {
            buildingName: "",
            city: "",
            district: "",
            shortNationalAddress: "",
          };

          // Close the save form first
          setShowSaveForm(false);

          // Ensure shipping option drawer is closed on mobile (if within CheckoutProvider)
          checkoutContext?.setDeliveryAddressFlowState(null);
          checkoutContext?.setIsShippingOptionDrawerOpen(false);

          // Small delay to ensure event is processed before navigation (especially on mobile)
          setTimeout(() => {
            window.history.back();
          }, 100);
        }
      }
    } catch (error) {
      console.error("[SaveForm] Exception saving address:", error);

      // Determine error type and show appropriate localized message
      let errorMessage = tCommonErrors("unknownError");

      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Network-related error
        errorMessage = tCommonErrors("networkError");
      } else if (error instanceof Error && error.name === "AbortError") {
        // Request timeout
        errorMessage = tCommonErrors("timeoutError");
      }
      showError(errorMessage, " ");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="address-form-filled-ui flex h-[90vh] flex-col overflow-y-auto bg-[#f9f9f9]">
      {/* Header */}

      {/* Address Display */}
      <div className="m-5 rounded-[10px] border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Image
              alt="Saudi Arabia"
              className="mt-0.5 size-6 flex-shrink-0"
              height={24}
              src={KSALogo}
              width={24}
            />
            <div className="flex-1">
              <p className="text-text-primary text-sm leading-relaxed">
                {displayedAddress || "No address selected"}
              </p>
            </div>
          </div>
          <button
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-black transition hover:text-gray-800"
            onClick={() => setShowSaveForm(false)}
            type="button"
          >
            <Image
              alt="Edit"
              className="size-4"
              height={16}
              src={EditIcon}
              width={16}
            />
            {t("edit")}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex flex-1 flex-col bg-[#f9f9f9] px-5 py-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 pb-6">
            {showKsaValidationLoader && (
              <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Spinner size={16} variant="dark" />
                  {t("validatingAddressLocation")}
                </div>
              </div>
            )}
            {/* City Input with Suggestions */}
            <div className="relative">
              <FloatingLabelInput
                alwaysShowLabel
                inputProps={{
                  className: cn(
                    formData.city
                      ? "bg-white border border-gray-300"
                      : "bg-[#F3F3F3]"
                  ),
                  onBlur: () => {
                    setIsCityFocused(false);
                    setShowCitySuggestions(false);
                  },
                  onChange: (e) => handleInputChange("city", e.target.value),
                  onFocus: () => {
                    setIsCityFocused(true);
                    setShowCitySuggestions(true);
                  },
                  value: formData.city,
                }}
                label={t("city")}
              />
              {showCitySuggestions &&
                formData.city.length >= 1 &&
                filteredCities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-[9999] mt-1 rounded-lg border border-gray-200 bg-white shadow-sm">
                    {citiesLoading ? (
                      <div className="px-4 py-2 text-center text-sm text-gray-500">
                        {t("loadingCities")}
                      </div>
                    ) : (
                      filteredCities.map((city) => (
                        <button
                          className="w-full px-4 py-2 text-start text-sm transition first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
                          key={city.value}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSelectCity(city.label);
                          }}
                          type="button"
                        >
                          {city.label}
                        </button>
                      ))
                    )}
                  </div>
                )}
              {showCityNoMatchDropdown && (
                <div className="absolute left-0 right-0 top-full z-[9999] mt-1 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="px-4 py-2 text-center text-sm text-gray-500">
                    {t("noMatchingCity")}
                  </div>
                </div>
              )}
            </div>

            {/* District Input with Suggestions */}
            <div className="relative">
              <FloatingLabelInput
                alwaysShowLabel
                inputProps={{
                  className: cn(
                    formData.district
                      ? "bg-white border border-gray-300"
                      : "bg-[#F3F3F3]"
                  ),
                  onChange: (e) =>
                    handleInputChange("district", e.target.value),
                  onFocus: () => {
                    if (formData.city) {
                      setShowDistrictSuggestions(true);
                    }
                  },
                  value: formData.district,
                }}
                label={t("district")}
              />
              {showDistrictSuggestions &&
                formData.city &&
                formData.district.length >= 1 && (
                  <>
                    {filteredDistricts.length > 0 ? (
                      <div className="absolute left-0 right-0 top-full z-[9999] mt-1 rounded-lg border border-gray-200 bg-white shadow-sm">
                        {districtsLoading ? (
                          <div className="px-4 py-2 text-center text-sm text-gray-500">
                            Loading districts...
                          </div>
                        ) : (
                          filteredDistricts.map((district) => (
                            <button
                              className="w-full px-4 py-2 text-start text-sm transition first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
                              key={district.value}
                              onClick={() =>
                                handleSelectDistrict(district.label)
                              }
                              type="button"
                            >
                              {district.label}
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      !districtsLoading && (
                        <div className="absolute left-0 right-0 top-full z-[9999] mt-1 rounded-lg border border-gray-200 bg-white shadow-sm">
                          <div className="px-4 py-2 text-center text-sm text-gray-500">
                            {t("noDistrictsFound")}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              {!formData.city && (
                <p className="mt-1 text-xs text-gray-500">
                  {t("selectCityFirst")}
                </p>
              )}
            </div>

            {/* Building Name (Optional) */}
            <div>
              <FloatingLabelInput
                alwaysShowLabel
                inputProps={{
                  className: cn(
                    formData.buildingName
                      ? "bg-white border border-gray-300"
                      : "bg-[#F3F3F3]"
                  ),
                  onChange: (e) =>
                    handleInputChange("buildingName", e.target.value),
                  value: formData.buildingName,
                }}
                label={t("buildingNameOptional")}
              />
            </div>

            {/* Short National Address */}
            <div>
              <FloatingLabelInput
                alwaysShowLabel
                inputProps={{
                  className: cn(
                    formData.shortNationalAddress
                      ? "bg-white border border-gray-300"
                      : "bg-[#F3F3F3]"
                  ),
                  onChange: (e) =>
                    handleInputChange("shortNationalAddress", e.target.value),
                  value: formData.shortNationalAddress,
                }}
                label={t("shortNationalAddress")}
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
                  {t("incorrectNationalAddressWarning")}
                </p>
              </div>
            </div>

            {/* Name Fields - Side by Side */}
            <div className="grid grid-cols-2 gap-x-2.5">
              <div>
                <FloatingLabelInput
                  alwaysShowLabel
                  inputProps={{
                    className: cn(
                      "recipient-first-name-input",
                      formData.firstName
                        ? "bg-white border border-gray-300"
                        : "bg-[#F3F3F3]"
                    ),
                    maxLength: 50,
                    onChange: (e) =>
                      handleInputChange("firstName", e.target.value),
                    value: formData.firstName,
                  }}
                  label={
                    isGiftDelivery ? t("recipientFirstName") : t("firstName")
                  }
                  labelProps={{
                    className:
                      "peer-placeholder-shown:text-sm whitespace-nowrap",
                  }}
                />
              </div>

              <div>
                <FloatingLabelInput
                  alwaysShowLabel
                  inputProps={{
                    className: cn(
                      "recipient-last-name-input",
                      formData.lastName
                        ? "bg-white border border-gray-300"
                        : "bg-[#F3F3F3]"
                    ),
                    maxLength: 50,
                    onChange: (e) =>
                      handleInputChange("lastName", e.target.value),
                    value: formData.lastName,
                  }}
                  label={
                    isGiftDelivery ? t("recipientLastName") : t("lastName")
                  }
                  labelProps={{
                    className:
                      "peer-placeholder-shown:text-sm whitespace-nowrap",
                  }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <FormProvider {...phoneForm}>
                <ControlledPhoneNumberField
                  disabled={!isGiftDelivery && !!customerData?.phoneNumber}
                  floatingLabelInputProps={{
                    label: isGiftDelivery
                      ? t("receiverPhoneNumber")
                      : t("mobileNumber"),
                    labelProps: { className: "[&>span]:!opacity-100" },
                  }}
                  name="phone"
                  showVerifyIcon={!isGiftDelivery}
                />
              </FormProvider>
              {phoneNumberError && isGiftDelivery && (
                <p className="mt-1 text-xs text-red-500">{phoneNumberError}</p>
              )}
            </div>

            {/* Sender Information - Only show for gift delivery if user doesn't have name data */}
            {isGiftDelivery &&
              (!customerData?.firstName || !customerData?.lastName) && (
                <>
                  <div className="col-span-2 mt-5">
                    <Label className="text-text-secondary text-sm font-medium">
                      {t("senderInformation")}
                    </Label>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-x-2.5">
                    <div>
                      <FloatingLabelInput
                        alwaysShowLabel
                        inputProps={{
                          className: cn(
                            "sender-first-name-input",
                            senderFirstName
                              ? "bg-white border border-gray-300"
                              : "bg-[#F3F3F3]"
                          ),
                          maxLength: 50,
                          onChange: (e) => setSenderFirstName(e.target.value),
                          value: senderFirstName,
                        }}
                        label={t("firstName")}
                      />
                    </div>
                    <div>
                      <FloatingLabelInput
                        alwaysShowLabel
                        inputProps={{
                          className: cn(
                            "sender-last-name-input",
                            senderLastName
                              ? "bg-white border border-gray-300"
                              : "bg-[#F3F3F3]"
                          ),
                          maxLength: 50,
                          onChange: (e) => setSenderLastName(e.target.value),
                          value: senderLastName,
                        }}
                        label={t("lastName")}
                      />
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 flex-col gap-6 pb-8 pt-5">
          {!isGiftDelivery && (
            <div className="transition-default flex transform items-center gap-2.5 py-1.5">
              <Checkbox
                checked={formData.setAsDefault}
                className="peer size-4"
                disabled={isFirstAddressInCheckout}
                id="setAsDefault"
                onCheckedChange={(checked) =>
                  handleInputChange("setAsDefault", checked as boolean)
                }
              />
              <Label
                className="transition-default text-text-primary block text-sm font-medium peer-data-[state=checked]:font-semibold"
                htmlFor="setAsDefault"
              >
                {t("setAsDefaultAddress")}
              </Label>
            </div>
          )}

          <button
            className={cn(
              "inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] text-[16px] font-medium transition",
              !isConfirmDisabled
                ? "bg-[#374957] text-white hover:bg-[#374957]/90"
                : "cursor-not-allowed bg-[#B5B8C1] text-white"
            )}
            disabled={isConfirmDisabled}
            onClick={handleConfirmAddress}
            type="button"
          >
            {t("confirmDeliveryAddress")}
          </button>

          <button
            className="text-[16px] font-medium text-[#374957] underline transition hover:no-underline"
            onClick={() => {
              setIsManualEntryMode(true);
              setShowSaveForm(true);
            }}
            type="button"
          >
            {t("enterAddressManually")}
          </button>
        </div>
      </div>
    </div>
  );
};
