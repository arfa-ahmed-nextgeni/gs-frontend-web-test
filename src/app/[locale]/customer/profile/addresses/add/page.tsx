import { unauthorized } from "next/navigation";

import { getLocale } from "next-intl/server";

import { AddDeliveryAddressStandaloneContainer } from "@/components/checkout/add-delivery-address/add-delivery-address-standalone-container";
import { ManageAddressView } from "@/components/customer/addresses/manage-address/manage-address-view";
import { AddDeliveryAddressContextProvider } from "@/contexts/add-delivery-address-context";
import { AddressFormContextProvider } from "@/contexts/address-form-context";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { getCustomerAddresses } from "@/lib/actions/customer/get-customer-addresses";
import { Locale, StoreCode } from "@/lib/constants/i18n";
import { getStoreCode } from "@/lib/utils/country";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

export default async function AddAddressPage() {
  const currentCustomer = await getCurrentCustomer();
  const locale = (await getLocale()) as Locale;

  if (isUnauthenticated(currentCustomer)) {
    unauthorized();
  }

  if (isError(currentCustomer)) {
    throw new Error(
      currentCustomer.error || "Failed to fetch customer profile"
    );
  }

  const customerData = {
    email: currentCustomer.data?.email,
    firstName: currentCustomer.data?.firstName,
    lastName: currentCustomer.data?.lastName,
    phoneNumber: currentCustomer.data?.phoneNumber,
  };
  const storeCode = getStoreCode(locale);
  const isSaudiStore =
    storeCode === StoreCode.ar_sa || storeCode === StoreCode.en_sa;

  const customerAddressesResult = await getCustomerAddresses();
  const isFirstAddressInCheckout = isOk(customerAddressesResult)
    ? customerAddressesResult.data.addresses.length === 0
    : false;

  if (isSaudiStore) {
    return (
      <AddDeliveryAddressContextProvider
        customerData={customerData}
        deliveryType="home_delivery"
        isFirstAddressInCheckout={isFirstAddressInCheckout}
      >
        <AddDeliveryAddressStandaloneContainer />
      </AddDeliveryAddressContextProvider>
    );
  }

  return (
    <AddressFormContextProvider
      customerData={customerData}
      isFirstAddressInCheckout={isFirstAddressInCheckout}
    >
      <ManageAddressView />
    </AddressFormContextProvider>
  );
}
