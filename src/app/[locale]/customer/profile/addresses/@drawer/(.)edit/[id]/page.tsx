import { unauthorized } from "next/navigation";

import { getLocale } from "next-intl/server";

import { AddDeliveryAddressStandaloneContainer } from "@/components/checkout/add-delivery-address/add-delivery-address-standalone-container";
import { ManageAddressView } from "@/components/customer/addresses/manage-address/manage-address-view";
import { AddDeliveryAddressContextProvider } from "@/contexts/add-delivery-address-context";
import { AddressFormContextProvider } from "@/contexts/address-form-context";
import { redirect } from "@/i18n/navigation";
import { getAreas } from "@/lib/actions/config/get-areas";
import { getCountries } from "@/lib/actions/config/get-countries";
import { getStates } from "@/lib/actions/config/get-states";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { getCustomerAddress } from "@/lib/actions/customer/get-customer-address";
import { Locale, LOCALE_TO_STORE, StoreCode } from "@/lib/constants/i18n";
import { ROUTE_PLACEHOLDER, ROUTES } from "@/lib/constants/routes";
import { isGlobalStore } from "@/lib/utils/country";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

export default async function EditAddressPage({
  params,
}: PageProps<"/[locale]/customer/profile/addresses/edit/[id]">) {
  const currentCustomer = await getCurrentCustomer();

  if (isUnauthenticated(currentCustomer)) {
    unauthorized();
  }

  if (isError(currentCustomer)) {
    throw new Error(
      currentCustomer.error || "Failed to fetch customer profile"
    );
  }

  const { id } = await params;
  const locale = (await getLocale()) as Locale;
  const storeCode = LOCALE_TO_STORE[locale];

  if (id === ROUTE_PLACEHOLDER) {
    redirect({ href: ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT, locale });
  }

  const response = await getCustomerAddress({ id });

  if (isOk(response)) {
    const {
      data: { address, customerData },
    } = response;
    const isSaudiStore =
      storeCode === StoreCode.ar_sa || storeCode === StoreCode.en_sa;
    const rawAddress = address.raw as {
      address_label?: string;
      latitude?: string;
      longitude?: string;
      telephone?: string;
    };
    const latitude = Number(rawAddress.latitude);
    const longitude = Number(rawAddress.longitude);
    const initialSelectedLocation =
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { lat: latitude, lng: longitude }
        : null;
    const deliveryType =
      rawAddress.address_label?.toLowerCase() === "gift"
        ? "gift_delivery"
        : "home_delivery";

    if (isSaudiStore) {
      return (
        <AddDeliveryAddressContextProvider
          customerData={structuredClone(customerData)}
          deliveryType={deliveryType}
          initialContactData={{
            firstName: address.firstName,
            lastName: address.lastName,
            phoneNumber: rawAddress.telephone || address.mobileNumber || "",
          }}
          initialSelectedLocation={initialSelectedLocation}
        >
          <AddDeliveryAddressStandaloneContainer />
        </AddDeliveryAddressContextProvider>
      );
    }

    let skipArea = false;
    let skipState = false;
    let stateLabel = "";
    let countryLabel = "";

    if (isGlobalStore(storeCode)) {
      const [countriesResult, statesResult] = await Promise.allSettled([
        getCountries({ locale }),
        getStates({
          countryCode: address.countryCode,
          locale,
        }),
      ]);

      if (
        countriesResult.status === "fulfilled" &&
        isOk(countriesResult.value)
      ) {
        const foundCountry = countriesResult.value.data.find(
          (country) => country.value === address.countryCode
        );

        countryLabel = foundCountry?.label || "";
      }

      if (statesResult.status === "fulfilled" && isOk(statesResult.value)) {
        const foundState = statesResult.value.data?.find(
          (state) => String(state.value) === String(address.regionId)
        );
        stateLabel = foundState?.label || "";

        skipState =
          !statesResult.value.data || statesResult.value.data.length === 0;
      }
    } else {
      const areasResponse = await getAreas({
        city: address.city,
        locale,
      });

      skipArea = areasResponse.data?.length === 0;
    }

    return (
      <AddressFormContextProvider
        customerAddress={{
          ...structuredClone(address),
          countryLabel,
          stateLabel,
        }}
        customerData={structuredClone(customerData)}
        initialSkipArea={skipArea}
        initialSkipState={skipState}
      >
        <ManageAddressView />
      </AddressFormContextProvider>
    );
  } else {
    redirect({ href: ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT, locale });
  }
}

export function generateStaticParams() {
  return [{ id: ROUTE_PLACEHOLDER }];
}
