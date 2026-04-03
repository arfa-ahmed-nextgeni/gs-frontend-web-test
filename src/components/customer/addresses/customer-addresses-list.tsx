import { Suspense } from "react";

import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { CustomerAddressCard } from "@/components/customer/addresses/customer-address-card";
import { CustomerAddressCardSkeleton } from "@/components/customer/addresses/customer-address-card-skeleton";
import { AddressesContextProvider } from "@/contexts/addresses-context";
import { Link } from "@/i18n/navigation";
import { getCountries } from "@/lib/actions/config/get-countries";
import { getStates } from "@/lib/actions/config/get-states";
import { getCustomerAddresses } from "@/lib/actions/customer/get-customer-addresses";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { ROUTES } from "@/lib/constants/routes";
import { getStoreCode, isGlobalStore } from "@/lib/utils/country";
import { isUnauthenticated } from "@/lib/utils/service-result";

export const CustomerAddressesList = async () => {
  const customerAddresses = await getCustomerAddresses();

  const locale = (await getLocale()) as Locale;

  const countriesPromise = getCountries({ locale });

  const t = await getTranslations("CustomerAddressesPage");

  if (isUnauthenticated(customerAddresses)) {
    unauthorized();
  }

  const addresses = customerAddresses.data?.addresses || [];

  const addressesLength = addresses.length || 0;

  const globalStore = isGlobalStore(getStoreCode(locale));

  const statesPromises = globalStore
    ? [...new Set(addresses.map((address) => address.countryCode))].map(
        (countryCode) => getStates({ countryCode, locale })
      )
    : [];

  return (
    <AddressesContextProvider addressesLength={addressesLength}>
      <Link
        className="transition-default bg-bg-default hover:bg-bg-surface text-text-primary flex h-12 w-full items-center justify-center rounded-xl text-xl font-medium shadow-[0_1px_0_0_var(--color-bg-surface)]"
        href={`${ROUTES.CUSTOMER.PROFILE.ADDRESSES.ADD}${addressesLength === 0 ? `?${QueryParamsKey.SetAsDefault}=true` : ""}`}
      >
        {t("addNewAddress")}
      </Link>
      <div className="gap-1.25 lg:gap-2.25 grid grid-cols-1 lg:grid-cols-2">
        {addresses?.map((address, index) => (
          <Suspense
            fallback={<CustomerAddressCardSkeleton index={index} />}
            key={`${address.id}-${addresses[addressesLength - 1]?.id}`}
          >
            <CustomerAddressCard
              {...address}
              countriesPromise={countriesPromise}
              defaultExpanded={index === 0}
              isOnlyAddress={addressesLength <= 1}
              statesPromise={
                globalStore
                  ? statesPromises[
                      [...new Set(addresses.map((a) => a.countryCode))].indexOf(
                        address.countryCode
                      )
                    ]
                  : undefined
              }
            />
          </Suspense>
        ))}
      </div>
    </AddressesContextProvider>
  );
};
