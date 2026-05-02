import { Suspense } from "react";

import type { Metadata } from "next";
import { headers } from "next/headers";

import { CheckoutTracker } from "@/components/analytics/checkout-tracker";
import CheckoutPage, {
  type CheckoutAddress,
} from "@/components/checkout/checkout-page";
import { SiteLogo } from "@/components/shared/site-logo";
import { redirect } from "@/i18n/navigation";
import { getCountries } from "@/lib/actions/config/get-countries";
import { getStates } from "@/lib/actions/config/get-states";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { getCustomerAddresses } from "@/lib/actions/customer/get-customer-addresses";
import { getCustomerPaymentCards } from "@/lib/actions/customer/get-customer-payment-cards";
import { ROUTES } from "@/lib/constants/routes";
import { getStoreCode, isGlobalStore } from "@/lib/utils/country";
import { generateAbsoluteCanonicalUrl } from "@/lib/utils/seo";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

import CheckoutPageLoading from "./loading";

import type { Locale } from "@/lib/constants/i18n";

export default async function CheckoutPageRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<CheckoutPageLoading />}>
      <Checkout locale={locale as Locale} />
    </Suspense>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const canonicalUrl = generateAbsoluteCanonicalUrl({
    locale: locale as Locale,
    pathname: "/checkout",
  });

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      follow: false,
      index: false,
    },
    title: "Checkout",
  };
}

async function Checkout({ locale }: { locale: Locale }) {
  const customerResult = await getCurrentCustomer();

  if (isError(customerResult)) {
    throw new Error(customerResult.error);
  }

  // Redirect if user is not authenticated
  if (isUnauthenticated(customerResult)) {
    // Detect mobile device from user agent
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );

    if (isMobile) {
      // Mobile: redirect to login page
      redirect({
        href: `${ROUTES.CUSTOMER.LOGIN}?redirect=${encodeURIComponent("/checkout")}`,
        locale,
      });
    } else {
      // Desktop: redirect to home page
      redirect({
        href: ROUTES.ROOT,
        locale,
      });
    }
  }

  // if (isError(customerResult)) {
  //   throw new Error(customerResult.error || "Failed to fetch customer profile");
  // }

  let initialAddresses: CheckoutAddress[] = [];

  const globalStore = isGlobalStore(getStoreCode(locale));

  if (!isUnauthenticated(customerResult)) {
    const addressesResult = await getCustomerAddresses();
    const countriesResult = await getCountries({ locale });

    const addresses = addressesResult.data?.addresses || [];

    const statesPromises = globalStore
      ? [...new Set(addresses.map((address) => address.countryCode))].map(
          (countryCode) => getStates({ countryCode, locale })
        )
      : [];

    const countryMap = new Map<string, string>();

    if (isOk(countriesResult)) {
      countriesResult.data.forEach((country) => {
        countryMap.set(country.value, country.label);
      });
    }

    initialAddresses =
      isOk(addressesResult) && addressesResult.data.addresses.length > 0
        ? await Promise.all(
            addressesResult.data.addresses.map(async (address) => {
              const countryLabel =
                countryMap.get(address.countryCode) || address.countryCode;

              const statesPromise =
                statesPromises[
                  [...new Set(addresses.map((a) => a.countryCode))].indexOf(
                    address.countryCode
                  )
                ];

              let stateLabel = "";

              if (globalStore) {
                const statesResponse = await statesPromise;
                if (isOk(statesResponse)) {
                  const foundState = statesResponse.data.find(
                    (state) => state.value === `${address.regionId}`
                  );

                  stateLabel = foundState?.label || "";
                }
              }

              return {
                customerAddress: {
                  ...address,
                  countryLabel,
                  stateLabel,
                },
                formattedAddress: address.formattedAddress,
                id: address.id,
                isDefault: address.isDefault,
                name: address.name,
                phoneNumber: address.mobileNumber,
              };
            })
          )
        : [];
  }

  const customerInfo = isUnauthenticated(customerResult)
    ? null
    : {
        email: customerResult.data?.email ?? "",
        firstName: customerResult.data?.firstName ?? "",
        lastName: customerResult.data?.lastName ?? "",
        phoneNumber: customerResult.data?.phoneNumber ?? "",
      };

  let initialPaymentCards: Array<{
    cardNetwork: string;
    checkoutPaymentId?: null | string;
    expiry: string;
    id: string;
    isDefault: boolean;
    isExpired: boolean;
    last4: string;
    sourceId: string;
  }> = [];
  if (!isUnauthenticated(customerResult)) {
    const paymentCardsResult = await getCustomerPaymentCards();
    if (isOk(paymentCardsResult) && paymentCardsResult.data) {
      initialPaymentCards = paymentCardsResult.data.paymentCards
        .filter((card) => {
          const hasSourceId = card.sourceId && card.sourceId.trim().length > 0;
          if (!hasSourceId) {
            console.warn(
              "[Checkout] Filtering out payment card without sourceId:",
              {
                cardId: card.id,
                isEmpty: card.sourceId === "",
                isNull: card.sourceId === null,
                isUndefined: card.sourceId === undefined,
                last4: card.last4,
                sourceId: card.sourceId,
                sourceIdType: typeof card.sourceId,
              }
            );
          }
          return hasSourceId;
        })
        .map((card) => ({
          cardNetwork: card.cardNetwork,
          checkoutPaymentId: card.checkoutPaymentId || null,
          expiry: card.expiry,
          id: card.id,
          isDefault: card.isDefault,
          isExpired: card.isExpired,
          last4: card.last4,
          sourceId: card.sourceId.trim(),
        }));
    }
  }

  return (
    <>
      <CheckoutTracker />
      <CheckoutPage
        customerInfo={customerInfo}
        initialAddresses={initialAddresses}
        initialPaymentCards={initialPaymentCards}
        logoSlot={<SiteLogo className="h-10 w-auto" />}
      />
    </>
  );
}
