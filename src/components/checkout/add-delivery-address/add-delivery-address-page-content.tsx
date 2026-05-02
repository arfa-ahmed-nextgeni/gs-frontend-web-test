import { unauthorized } from "next/navigation";

import { getLocale } from "next-intl/server";

import { AddDeliveryAddressContextBridge } from "@/components/checkout/add-delivery-address/add-delivery-address-context-bridge";
import { RedirectToCheckout } from "@/components/navigation/redirect-to-checkout";
import { estimateShippingMethodsAction } from "@/lib/actions/checkout/estimate-shipping-methods";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { getCustomerAddresses } from "@/lib/actions/customer/get-customer-addresses";
import { Locale } from "@/lib/constants/i18n";
import { getLocaleInfo } from "@/lib/utils/locale";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

interface AddDeliveryAddressPageContentProps {
  searchParams: Promise<{
    type?: string;
  }>;
}

export async function AddDeliveryAddressPageContent({
  searchParams,
}: AddDeliveryAddressPageContentProps) {
  const [resolvedSearchParams, locale] = await Promise.all([
    searchParams,
    getLocale(),
  ]);

  // Determine delivery type from search params (home_delivery or gift_delivery)
  const deliveryType = resolvedSearchParams.type || "home_delivery";

  // Get country code from locale upfront so all fetches can run in parallel
  const localeInfo = getLocaleInfo(locale as Locale);
  // For GLOBAL locales, use 'US' as the country code
  const countryCode = localeInfo.region === "GLOBAL" ? "US" : localeInfo.region;

  // Run all three data fetches in parallel to reduce page load time
  const [currentCustomer, shippingMethodsResult, customerAddressesResult] =
    await Promise.all([
      getCurrentCustomer(),
      estimateShippingMethodsAction({ countryCode }),
      getCustomerAddresses(),
    ]);

  if (isUnauthenticated(currentCustomer)) {
    unauthorized();
  }

  if (isError(currentCustomer)) {
    throw new Error(
      currentCustomer.error || "Failed to fetch customer profile"
    );
  }

  if (isOk(shippingMethodsResult)) {
    const methods = shippingMethodsResult.data.methods;

    // Define expected method codes for delivery types
    const expectedCodes = {
      gift_delivery: ["gift_delivery", "gifting"],
      home_delivery: ["flatrate", "flat_rate", "lambdashipping_flatrate"],
    };

    const expectedMethodCodes =
      expectedCodes[deliveryType as keyof typeof expectedCodes] || [];

    // Check if any method matches the expected codes
    const isDeliveryMethodAvailable = methods.some((method) => {
      if (!method.available) return false;

      const methodCode = method.method_code?.toLowerCase() || "";
      const carrierCode = method.carrier_code?.toLowerCase() || "";
      const combined =
        method.carrier_code && method.method_code
          ? `${carrierCode}_${methodCode}`.toLowerCase()
          : "";

      return expectedMethodCodes.some((code) => {
        const lowerCode = code.toLowerCase();
        return (
          methodCode === lowerCode ||
          carrierCode === lowerCode ||
          combined.includes(lowerCode) ||
          combined.includes(`lambdashipping_${lowerCode}`)
        );
      });
    });

    // If home delivery method is not available, redirect to checkout
    // (Gift delivery can proceed even without specific methods)
    if (deliveryType === "home_delivery" && !isDeliveryMethodAvailable) {
      return <RedirectToCheckout />;
    }
  }

  const customerData = {
    email: currentCustomer.data?.email,
    firstName: currentCustomer.data?.firstName,
    lastName: currentCustomer.data?.lastName,
    phoneNumber: currentCustomer.data?.phoneNumber,
  };

  // A gift address is not considered as first address, since it doesn't have a default billing address associated with it. This is important to determine if we should show the "Set as default" option in the form.
  const isFirstAddressInCheckout = isOk(customerAddressesResult)
    ? deliveryType === "home_delivery" &&
      !customerAddressesResult.data.addresses.some((address) => {
        const addressLabel =
          (address.raw?.address_label as string | undefined)?.toLowerCase() ||
          "";

        return addressLabel !== "gift";
      })
    : false;

  return (
    <AddDeliveryAddressContextBridge
      customerData={customerData}
      deliveryType={deliveryType}
      isFirstAddressInCheckout={isFirstAddressInCheckout}
    />
  );
}
