import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { ShippingAddressInput } from "@/graphql/graphql";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useLockerLocations } from "@/hooks/queries/use-locker-locations";
import { addLockerAddressOnCart } from "@/lib/actions/checkout/add-locker-address-on-cart";
import { updateProfileFromAddress } from "@/lib/actions/customer/update-profile";
import {
  trackBillingInfoError,
  trackConfirmBillingInfo,
} from "@/lib/analytics/events";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import {
  AddPickupPointAddressFormField,
  addPickupPointAddressFormSchema,
} from "@/lib/forms/add-pickup-point-address";
import { storeLockerInfo } from "@/lib/utils/checkout/locker-storage";
import { getShippingTypeFromOption } from "@/lib/utils/checkout/shipping-type";
import { getDefaultCountryCode } from "@/lib/utils/country";
import { getPhoneDetails } from "@/lib/utils/phone-utils";
import { isError } from "@/lib/utils/service-result";

export const useAddPickupPointAddressForm = () => {
  const queryClient = useQueryClient();
  const {
    closeDrawer,
    currentLocation,
    customerData,
    lockerType,
    selectedLockerId,
  } = useAddPickupPointContext();
  const { setIsShippingOptionDrawerOpen, setSelectedLockerAddressType } =
    useCheckoutContext();
  const locale = useLocale() as Locale;
  const { language, region } = useLocaleInfo();
  const { storeCode } = useStoreCode();

  const t = useTranslations("AddPickupPointPage.messages");

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

  const phoneNumber = customerData?.phoneNumber;

  const addPickupPointAddressForm = useForm({
    defaultValues: {
      [AddPickupPointAddressFormField.Email]: customerData?.email || "",
      [AddPickupPointAddressFormField.FirstName]: customerData?.firstName || "",
      [AddPickupPointAddressFormField.LastName]: customerData?.lastName || "",
      [AddPickupPointAddressFormField.PhoneNumber]: phoneNumber
        ? getPhoneDetails(phoneNumber)
        : {
            countryCode: getDefaultCountryCode(storeCode),
            number: "",
          },
    },
    mode: "onTouched",
    resolver: zodResolver(addPickupPointAddressFormSchema(storeCode)),
  });

  const { handleSubmit } = addPickupPointAddressForm;

  const handleSubmitForm = handleSubmit(
    async (data) => {
      if (!selectedLockerId || !selectedLocker) {
        console.error("No locker selected");
        return;
      }

      const shippingType = getShippingTypeFromOption(lockerType);

      try {
        const email = data[AddPickupPointAddressFormField.Email];
        const firstName = data[AddPickupPointAddressFormField.FirstName];
        const lastName = data[AddPickupPointAddressFormField.LastName];

        const profilePayload = {
          ...(!customerData?.email && email && { email }),
          ...(!customerData?.firstName && firstName && { firstName }),
          ...(!customerData?.lastName && lastName && { lastName }),
        };

        if (Object.keys(profilePayload).length > 0) {
          const updateProfileResponse =
            await updateProfileFromAddress(profilePayload);

          if (isError(updateProfileResponse)) {
            // Track billing_info_error when info is entered incorrectly
            trackBillingInfoError(shippingType);
            toast({
              title: updateProfileResponse.error,
              type: "error",
            });
            return;
          }
        }

        let shippingAddress: ShippingAddressInput;

        if (lockerType === LockerType.Fodel) {
          // For Fodel: address_info -> street, city -> city
          // const street = selectedLocker.address; // address_info
          const city = selectedLocker.rawData?.fodelCity || "";

          shippingAddress = {
            address: {
              city,
              country_code: region,
              firstname: firstName,
              lastname: lastName,
              save_in_address_book: false,
              street: [selectedLocker.pointName || ""],
              telephone: `${data[AddPickupPointAddressFormField.PhoneNumber].countryCode}${data[AddPickupPointAddressFormField.PhoneNumber].number}`,
            },
          };
        } else {
          // For Redbox: address or address_ar -> region, city, street, postal_code
          const addressData =
            language === "ar" && selectedLocker.rawData?.redboxAddressAr
              ? selectedLocker.rawData.redboxAddressAr
              : selectedLocker.rawData?.redboxAddress;

          if (!addressData) {
            toast({
              title: t("failedToAddLockerAddressToCart"),
              type: "error",
            });
            return;
          }

          shippingAddress = {
            address: {
              city: addressData.city,
              country_code: region,
              firstname: firstName,
              lastname: lastName,
              postcode: addressData.postal_code,
              region: addressData.region,
              save_in_address_book: false,
              street: [selectedLocker.pointName || ""],
              telephone: `${data[AddPickupPointAddressFormField.PhoneNumber].countryCode}${data[AddPickupPointAddressFormField.PhoneNumber].number}`,
            },
          };
        }

        const result = await addLockerAddressOnCart(
          shippingAddress,
          lockerType,
          selectedLocker.id
        );

        if (isError(result)) {
          // Track billing_info_error when there is an error from API response
          trackBillingInfoError(shippingType);
          toast({
            title: result.error,
            type: "error",
          });
        } else {
          // Track confirm_billing_info when all info is entered correctly and continue button is clicked
          trackConfirmBillingInfo(shippingType);
          // Store locker information in session storage for display in checkout
          storeLockerInfo({
            lockerAddress: selectedLocker.address,
            lockerAddressAr: selectedLocker.addressAr,
            lockerId: selectedLocker.id,
            lockerName: selectedLocker.name,
            lockerNameAr: selectedLocker.nameAr,
            lockerType,
            pointName: selectedLocker.pointName,
          });

          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.CART.ROOT(locale),
          });
          setSelectedLockerAddressType(lockerType);
          setIsShippingOptionDrawerOpen(false);
          toast({
            title: result.data,
            type: "success",
          });
          closeDrawer();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        // Track billing_info_error when there is any error
        trackBillingInfoError(shippingType);
        toast({
          title: t("failedToAddLockerAddressToCart"),
          type: "error",
        });
      }
    },
    (errors) => {
      console.error("Add pickup point address form validation errors:", errors);
      // Track billing_info_error when form validation fails
      // Get shipping type for tracking (lockerType is available in closure)
      const shippingType = getShippingTypeFromOption(lockerType);
      trackBillingInfoError(shippingType);
    }
  );

  return {
    addPickupPointAddressForm,
    handleSubmitForm,
  };
};
