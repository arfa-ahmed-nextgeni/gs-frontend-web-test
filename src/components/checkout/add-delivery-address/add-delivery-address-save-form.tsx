"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import EditIcon from "@/assets/icons/edit-icon.svg";
import InfoIconYellow from "@/assets/icons/info-icon-yellow.svg";
import KSALogo from "@/assets/logos/ksa-na-logo.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { useOptionalCheckoutContext } from "@/contexts/checkout-context";
import { useAddressOptionsQuery } from "@/hooks/use-address-options-query";
import { addDeliveryAddress } from "@/lib/actions/checkout/add-delivery-address";
import { getKsaAddress } from "@/lib/actions/customer/get-ksa-address";
import { AddressStepType } from "@/lib/constants/address";
import {
  CHECKOUT_ADDRESS_SAVED_EVENT,
  CHECKOUT_ADDRESS_SAVED_FLAG,
} from "@/lib/constants/checkout/events";
import { cn } from "@/lib/utils";
import { isValidPhoneNumber } from "@/lib/utils/country";
import {
  emptyGoogleAddressData,
  sanitizeStreetValue,
} from "@/lib/utils/google-address";
import { isOk } from "@/lib/utils/service-result";

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
  const [isLoadingKsa, setIsLoadingKsa] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState<null | string>(null);

  const {
    customerData,
    deliveryType,
    googleAddressData,
    initialContactData,
    ksaAddress,
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
    : ensureSaudiPhonePrefix(customerData?.phoneNumber ?? "");

  // Fetch KSA address data when component mounts or selectedLocation changes
  useEffect(() => {
    let isActive = true;

    const fetchKsaAddress = async () => {
      if (!selectedLocation) return;

      setIsLoadingKsa(true);
      setKsaAddress(null);

      const result = await getKsaAddress({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      });

      // Only update state if this effect is still active (not cancelled)
      if (!isActive) return;

      if (isOk(result)) {
        setKsaAddress(result.data);
      } else {
        setKsaAddress(null);
      }

      setIsLoadingKsa(false);
    };

    fetchKsaAddress();

    // Cleanup: mark effect as inactive if dependencies change before API completes
    return () => {
      isActive = false;
    };
  }, [selectedLocation, setKsaAddress]);

  const fallbackAddressData = googleAddressData || emptyGoogleAddressData();

  // Build address data: prefer KSA data, fallback to Google reverse geocoding
  const addressData = useMemo(
    () => ({
      city: ksaAddress?.city || fallbackAddressData.city,
      district: ksaAddress?.district || fallbackAddressData.district,
      postalCode: ksaAddress?.postCode || fallbackAddressData.postalCode,
      shortCode: ksaAddress?.short_address || fallbackAddressData.shortCode,
      street: sanitizeStreetValue({
        district: ksaAddress?.district || fallbackAddressData.district,
        shortCode: ksaAddress?.short_address || fallbackAddressData.shortCode,
        street:
          ksaAddress?.address1 ||
          ksaAddress?.street ||
          fallbackAddressData.street ||
          selectedAddress ||
          "",
      }),
    }),
    [fallbackAddressData, ksaAddress, selectedAddress]
  );

  const [formData, setFormData] = useState({
    buildingName: "",
    city: "",
    district: "",
    firstName: initialFirstName,
    lastName: initialLastName,
    phoneNumber: initialPhoneNumber,
    setAsDefault: true,
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
      city: formData.city,
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

    // Phone number validation for receiver (gift delivery)
    if (
      field === "phoneNumber" &&
      isGiftDelivery &&
      typeof value === "string"
    ) {
      const cleanNumber = value.replace(/\D/g, "");
      const trimmedValue = value.trim();

      // If field is empty, clear error
      if (!trimmedValue) {
        setPhoneNumberError(null);
      }
      // If field has content, validate it properly
      else if (!cleanNumber) {
        // No digits at all
        setPhoneNumberError(tValidationErrors("invalidPhoneNumber"));
      } else {
        // Strip country code if present (966) for Saudi validation
        let numberToValidate = cleanNumber;
        if (cleanNumber.startsWith("966")) {
          numberToValidate = cleanNumber.slice(3); // Remove "966" prefix
        }

        if (!isValidPhoneNumber(numberToValidate, "SA", undefined, true)) {
          setPhoneNumberError(tValidationErrors("invalidPhoneNumber"));
        } else {
          setPhoneNumberError(null);
        }
      }
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
    isLoadingKsa ||
    !selectedLocation ||
    !formData.city.trim() ||
    showNoMatchingCity ||
    !formData.firstName.trim() ||
    !formData.lastName.trim() ||
    (!isGiftDelivery && !formData.phoneNumber.trim()) ||
    (isGiftDelivery &&
      (!formData.phoneNumber.trim() ||
        formData.phoneNumber.trim() === "+966" ||
        !!phoneNumberError));

  const handleConfirmAddress = async () => {
    if (isConfirmDisabled) {
      return;
    }

    setIsPending(true);

    try {
      // Call the server action to save the address
      const result = await addDeliveryAddress({
        addressLabel: deliveryType === "gift_delivery" ? "gift" : "home",
        city: formData.city,
        district: formData.district,
        firstName: formData.firstName,
        ksaShortAddress: formData.shortNationalAddress,
        lastName: formData.lastName,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        phoneNumber: formData.phoneNumber,
        postalCode: addressData.postalCode,
        setAsDefault: formData.setAsDefault,
        street: formData.buildingName,
      });

      if (isOk(result)) {
        console.info("[SaveForm] Address saved successfully:", {
          createCustomerAddress: result.data,
          isKsaVerified: result.data?.is_ksa_verified,
        });
        window.sessionStorage.setItem(CHECKOUT_ADDRESS_SAVED_FLAG, "true");
        window.dispatchEvent(new CustomEvent(CHECKOUT_ADDRESS_SAVED_EVENT));

        // Clear form and map data before navigating back
        setFormData({
          buildingName: "",
          city: "",
          district: "",
          firstName: initialFirstName,
          lastName: initialLastName,
          phoneNumber: initialPhoneNumber,
          setAsDefault: true,
          shortNationalAddress: "",
        });
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
        checkoutContext?.setIsShippingOptionDrawerOpen(false);

        // Small delay to ensure event is processed before navigation (especially on mobile)
        setTimeout(() => {
          window.history.back();
        }, 100);
      } else {
        console.error("[SaveForm] Error saving address:", result.error);
        showError(result.error, " ");
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
    <div className="flex h-[90vh] flex-col overflow-y-auto bg-[#f9f9f9]">
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
                {selectedAddress || "No address selected"}
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
            {isLoadingKsa && (
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
                          className="w-full px-4 py-2 text-left text-sm transition first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
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
                              className="w-full px-4 py-2 text-left text-sm transition first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50"
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
                  Please select a city first
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
                <style>{`
                  .recipient-first-name-input::placeholder {
                    font-size: 12px;
                  }
                `}</style>
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
                />
              </div>

              <div>
                <style>{`
                  .recipient-last-name-input::placeholder {
                    font-size: 12px;
                  }
                `}</style>
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
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <FloatingLabelInput
                alwaysShowLabel
                inputProps={{
                  className: cn(
                    formData.phoneNumber
                      ? "bg-white border border-gray-300"
                      : "bg-[#F3F3F3]",
                    phoneNumberError && "border-red-500 bg-red-50",
                    "rtl:text-right"
                  ),
                  dir: "ltr",
                  onChange: (e) =>
                    handleInputChange("phoneNumber", e.target.value),
                  placeholder: "+966XXXXXXXXX",
                  value: formData.phoneNumber,
                }}
                label={
                  isGiftDelivery ? t("receiverPhoneNumber") : t("mobileNumber")
                }
              />
              {phoneNumberError && isGiftDelivery && (
                <p className="mt-1 text-xs text-red-500">{phoneNumberError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 flex-col gap-6 pt-5">
          {!isGiftDelivery && (
            <div className="transition-default flex transform items-center gap-2.5 py-1.5">
              <Checkbox
                checked={formData.setAsDefault}
                className="peer size-4"
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
