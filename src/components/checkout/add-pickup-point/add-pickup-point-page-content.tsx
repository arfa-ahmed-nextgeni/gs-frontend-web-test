import { unauthorized } from "next/navigation";

import { getLocale } from "next-intl/server";

import { AddPickupPointContainer } from "@/components/checkout/add-pickup-point/add-pickup-point-container";
import { RedirectToCheckout } from "@/components/navigation/redirect-to-checkout";
import { AddPickupPointContextProvider } from "@/contexts/add-pickup-point-context";
import { estimateShippingMethodsAction } from "@/lib/actions/checkout/estimate-shipping-methods";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { Locale } from "@/lib/constants/i18n";
import { getLocaleInfo } from "@/lib/utils/locale";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

interface AddPickupPointPageContentProps {
  searchParams: Promise<{ type?: string }>;
}

export async function AddPickupPointPageContent({
  searchParams,
}: AddPickupPointPageContentProps) {
  const resolvedSearchParams = await searchParams;
  const locale = (await getLocale()) as Locale;

  const lockerType =
    resolvedSearchParams.type === LockerType.Fodel
      ? LockerType.Fodel
      : LockerType.Redbox;

  const currentCustomer = await getCurrentCustomer();

  if (isUnauthenticated(currentCustomer)) {
    unauthorized();
  }

  if (isError(currentCustomer)) {
    throw new Error(
      currentCustomer.error || "Failed to fetch customer profile"
    );
  }

  // Get country code from locale
  const localeInfo = getLocaleInfo(locale);
  // For GLOBAL locales, use 'US' as the country code
  const countryCode = localeInfo.region === "GLOBAL" ? "US" : localeInfo.region;

  // Check if the selected locker method is available
  const shippingMethodsResult = await estimateShippingMethodsAction({
    countryCode,
  });

  if (isOk(shippingMethodsResult)) {
    const methods = shippingMethodsResult.data.methods;

    // Define expected method codes for each locker type (matching the drawer component mapping)
    const expectedCodes = {
      [LockerType.Fodel]: [
        "fodellocker",
        "fodel_locker",
        "lambdashipping_fodellocker",
      ],
      [LockerType.Redbox]: [
        "redbox",
        "red_box",
        "redboxlocker",
        "lambdashipping_redbox",
        "lambdashipping_redboxlocker",
        "lambdashipping_redboxlocker_redboxlocker",
      ],
    };

    const expectedMethodCodes = expectedCodes[lockerType] || [];

    // Check if any method matches the expected codes
    const isLockerMethodAvailable = methods.some((method) => {
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

    // If locker method is not available, redirect to checkout
    if (!isLockerMethodAvailable) {
      return <RedirectToCheckout />;
    }
  }

  const customerData = {
    email: currentCustomer.data?.email,
    firstName: currentCustomer.data?.firstName,
    lastName: currentCustomer.data?.lastName,
    phoneNumber: currentCustomer.data?.phoneNumber,
  };

  return (
    <AddPickupPointContextProvider
      customerData={customerData}
      lockerType={lockerType}
    >
      <AddPickupPointContainer />
    </AddPickupPointContextProvider>
  );
}
