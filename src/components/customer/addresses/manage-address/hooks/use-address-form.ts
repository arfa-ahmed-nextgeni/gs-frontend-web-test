import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useParams, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";

import { useToastContext } from "@/components/providers/toast-provider";
import { useOptionalAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { addCustomerAddress } from "@/lib/actions/customer/add-customer-address";
import { getKsaAddress } from "@/lib/actions/customer/get-ksa-address";
import { updateCustomerAddress } from "@/lib/actions/customer/update-customer-address";
import { updateProfileFromAddress } from "@/lib/actions/customer/update-profile";
import { trackProfileUpdated } from "@/lib/analytics/events";
import { QueryParamsKey } from "@/lib/constants/query-params";
import {
  AddressFormField,
  addressFormSchema,
} from "@/lib/forms/manage-address";
import { CustomerAddress } from "@/lib/models/customer-addresses";
import {
  ServiceResultError,
  ServiceResultOk,
} from "@/lib/types/service-result";
import { getDefaultCountryCode, getPhoneDetails } from "@/lib/utils/country";
import { sanitizeStreetValue } from "@/lib/utils/google-address";
import { isError, isOk } from "@/lib/utils/service-result";

export const useAddressForm = ({
  closeDrawer,
  customerAddress,
  customerAddressId,
  customerData,
  initialAddressLabel,
  isFirstAddressInCheckout = false,
  onSuccess,
}: {
  closeDrawer: () => void;
  customerAddress?: {
    countryLabel?: string;
    stateLabel?: string;
  } & CustomerAddress;
  customerAddressId?: string;
  customerData?: {
    email?: null | string;
    firstName?: null | string;
    lastName?: null | string;
    phoneNumber?: null | string;
  };
  initialAddressLabel?: string;
  isFirstAddressInCheckout?: boolean;
  onSuccess?: () => void;
}) => {
  const params = useParams();
  const paramsId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;
  const effectiveId = customerAddressId ?? paramsId;
  const searchParams = useSearchParams();

  const setAsDefaultRequested =
    searchParams.get(QueryParamsKey.SetAsDefault) === "true";

  const { isGlobal, storeCode } = useStoreCode();
  const addDeliveryAddressContext = useOptionalAddDeliveryAddressContext();

  const { showError, showSuccess } = useToastContext();

  // Check if this is a new address (not edit mode)
  const isNewAddress = !customerAddress;

  // Check if this is a new gift address
  const addressLabelValue =
    initialAddressLabel ||
    (customerAddress?.raw?.address_label as string | undefined) ||
    "";
  const isNewGiftAddress =
    isNewAddress && addressLabelValue?.toLowerCase() === "gift";

  const phoneNumber = isNewGiftAddress
    ? undefined
    : (customerAddress as any)?.raw?.telephone ||
      customerData?.phoneNumber ||
      customerAddress?.mobileNumber;
  const ksaShortAddress =
    ((customerAddress as any)?.raw?.ksa_short_address as string) || "";
  const ksaAdditionalNumber =
    ((customerAddress as any)?.raw?.ksa_additional_number as string) || "";
  const ksaBuildingNumber =
    ((customerAddress as any)?.raw?.ksa_building_number as string) || "";
  const latitude =
    ((customerAddress as any)?.raw?.latitude as string) ||
    (addDeliveryAddressContext?.selectedLocation
      ? `${addDeliveryAddressContext.selectedLocation.lat}`
      : "");
  const longitude =
    ((customerAddress as any)?.raw?.longitude as string) ||
    (addDeliveryAddressContext?.selectedLocation
      ? `${addDeliveryAddressContext.selectedLocation.lng}`
      : "");

  const addressForm = useForm({
    defaultValues: {
      [AddressFormField.AddressLabel]: addressLabelValue,
      [AddressFormField.Area]: isGlobal
        ? customerAddress?.regionName || ""
        : {
            label: customerAddress?.regionName || "",
            value: customerAddress?.regionName || "",
          },
      [AddressFormField.BuildingName]: isGlobal
        ? customerAddress?.street?.[1] || ""
        : sanitizeStreetValue({
            district: customerAddress?.regionName || "",
            shortCode: ksaShortAddress,
            street: customerAddress?.street?.[0] || "",
          }),
      [AddressFormField.City]: isGlobal
        ? customerAddress?.city || ""
        : {
            label: customerAddress?.cityCode || "",
            value: customerAddress?.city || "",
          },
      [AddressFormField.Country]: {
        label:
          customerAddress?.countryLabel || customerAddress?.countryCode || "",
        value: customerAddress?.countryCode || "",
      },
      [AddressFormField.Email]: "",
      [AddressFormField.FirstName]:
        customerAddress?.firstName ||
        (isNewGiftAddress ? "" : customerData?.firstName || ""),
      [AddressFormField.KsaAdditionalNumber]: ksaAdditionalNumber,
      [AddressFormField.KsaBuildingNumber]: ksaBuildingNumber,
      [AddressFormField.KsaShortAddress]: ksaShortAddress,
      [AddressFormField.LastName]:
        customerAddress?.lastName ||
        (isNewGiftAddress ? "" : customerData?.lastName || ""),
      [AddressFormField.Latitude]: latitude,
      [AddressFormField.Longitude]: longitude,
      [AddressFormField.MiddleName]: isGlobal
        ? customerAddress?.middleName || ""
        : "",
      [AddressFormField.PhoneNumber]: phoneNumber
        ? getPhoneDetails(phoneNumber)
        : {
            countryCode: getDefaultCountryCode(storeCode),
            number: "",
          },
      [AddressFormField.PostalCode]: customerAddress?.postcode || "",
      [AddressFormField.SaveAsDefault]:
        setAsDefaultRequested ||
        customerAddress?.isDefault ||
        (isFirstAddressInCheckout && isNewAddress) ||
        false,
      [AddressFormField.SenderFirstName]: "",
      [AddressFormField.SenderLastName]: "",
      [AddressFormField.State]: {
        label:
          customerAddress?.stateLabel || `${customerAddress?.regionId}` || "",
        value: `${customerAddress?.regionId}` || "",
      },
      [AddressFormField.Street]: isGlobal
        ? customerAddress?.street?.[0] || ""
        : "",
    },
    mode: "onChange",
    resolver: zodResolver(addressFormSchema(storeCode)),
  });

  const { handleSubmit } = addressForm;

  useEffect(() => {
    const selectedLocation = addDeliveryAddressContext?.selectedLocation;

    if (!selectedLocation) {
      return;
    }

    addressForm.setValue(AddressFormField.Latitude, `${selectedLocation.lat}`, {
      shouldDirty: false,
      shouldTouch: false,
    });
    addressForm.setValue(
      AddressFormField.Longitude,
      `${selectedLocation.lng}`,
      {
        shouldDirty: false,
        shouldTouch: false,
      }
    );
  }, [addDeliveryAddressContext?.selectedLocation, addressForm]);

  useEffect(() => {
    const selectedLocation = addDeliveryAddressContext?.selectedLocation;

    if (!selectedLocation) {
      return;
    }

    let isActive = true;

    const syncKsaAddress = async () => {
      const existingKsaAddress = addDeliveryAddressContext?.ksaAddress;
      const ksaAddress =
        existingKsaAddress ||
        (
          await getKsaAddress({
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          })
        ).data;

      if (!isActive || !ksaAddress) {
        return;
      }

      addDeliveryAddressContext?.setKsaAddress(ksaAddress);
      addressForm.setValue(
        AddressFormField.KsaAdditionalNumber,
        ksaAddress.additionalNumber || "",
        {
          shouldDirty: false,
          shouldTouch: false,
        }
      );
      addressForm.setValue(
        AddressFormField.KsaBuildingNumber,
        ksaAddress.buildingNumber || "",
        {
          shouldDirty: false,
          shouldTouch: false,
        }
      );
      addressForm.setValue(
        AddressFormField.KsaShortAddress,
        ksaAddress.short_address ||
          addressForm.getValues(AddressFormField.KsaShortAddress),
        {
          shouldDirty: false,
          shouldTouch: false,
        }
      );
    };

    void syncKsaAddress();

    return () => {
      isActive = false;
    };
  }, [
    addDeliveryAddressContext,
    addressForm,
    addDeliveryAddressContext?.selectedLocation,
  ]);

  const handleSubmitForm = handleSubmit(
    async (data) => {
      let response: ServiceResultError | ServiceResultOk<string>;
      let updateProfileResponse: ServiceResultError | ServiceResultOk<string>;

      const email = data[AddressFormField.Email];
      const senderFirstName = data[AddressFormField.SenderFirstName];
      const senderLastName = data[AddressFormField.SenderLastName];
      const addressLabel = data[AddressFormField.AddressLabel];
      const isGiftAddress = addressLabel?.toLowerCase() === "gift";

      const profilePayload = {
        // For gift addresses, use sender name; for home addresses, use regular name
        ...(!customerData?.firstName &&
          (isGiftAddress
            ? senderFirstName &&
              senderFirstName.trim() && { firstName: senderFirstName }
            : data[AddressFormField.FirstName] &&
              data[AddressFormField.FirstName].trim() && {
                firstName: data[AddressFormField.FirstName].trim(),
              })),
        ...(!customerData?.lastName &&
          (isGiftAddress
            ? senderLastName &&
              senderLastName.trim() && { lastName: senderLastName }
            : data[AddressFormField.LastName] &&
              data[AddressFormField.LastName].trim() && {
                lastName: data[AddressFormField.LastName].trim(),
              })),
        // Only update email for home addresses (not gift addresses)
        ...(!isGiftAddress &&
          !customerData?.email &&
          email &&
          email.trim() && { email: email.trim() }),
      };

      if (Object.keys(profilePayload).length > 0) {
        updateProfileResponse = await updateProfileFromAddress(profilePayload);

        if (isError(updateProfileResponse)) {
          showError(updateProfileResponse.error, " ");
          return;
        }

        // Track profile_updated when user's profile updated from address form
        if (isOk(updateProfileResponse)) {
          trackProfileUpdated();
        }
      }

      if (effectiveId) {
        response = await updateCustomerAddress({ data, id: +effectiveId });
      } else {
        response = await addCustomerAddress(data);
      }

      if (isOk(response)) {
        showSuccess(response.data, " ");
        onSuccess?.();
        closeDrawer();
      } else {
        showError(response.error, " ");
      }
    },
    (error) => {
      console.error(error);
    }
  );

  return {
    addressForm,
    handleSubmitForm,
  };
};
