import { ComponentProps } from "react";

import { unauthorized } from "next/navigation";

import { getLocale } from "next-intl/server";

import { AccountTracker } from "@/components/analytics/account-tracker";
import {
  ACCOUNT_MENU_PRIMARY,
  ACCOUNT_MENU_SECONDARY,
} from "@/components/customer/account-panel/account-menu.config";
import { AccountNavId } from "@/components/customer/account-panel/account-menu.config";
import { AccountNavList } from "@/components/customer/account-panel/account-nav-list";
import { AccountPanelFooter } from "@/components/customer/account-panel/account-panel-footer";
import { AccountPanelLogOutButton } from "@/components/customer/account-panel/account-panel-log-out-button";
import { GuestPanel } from "@/components/customer/account-panel/guest-panel";
import { UserGreetingCard } from "@/components/customer/user-greeting-card";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { Locale } from "@/lib/constants/i18n";
import { cn } from "@/lib/utils";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

export const AccountPanel = async ({
  containerProps,
}: {
  containerProps?: ComponentProps<"aside">;
}) => {
  const currentCustomer = await getCurrentCustomer();

  const authToken = await getAuthToken();

  if (authToken && isUnauthenticated(currentCustomer)) {
    unauthorized();
  }

  const hasCustomerError = isError(currentCustomer);

  const locale = (await getLocale()) as Locale;
  const [storeConfigResult, pageLandingData] = await Promise.all([
    getStoreConfig({ locale }),
    getPageLandingData({ locale }),
  ]);
  const checkoutPayEnabled = storeConfigResult.data?.store?.checkoutPayEnabled;
  const hasCustomerServiceData = Boolean(
    pageLandingData?.websiteFooter?.contactAndSocialLinks?.contactSection
      ?.contacts?.length
  );

  const customerData = {
    firstName: hasCustomerError ? "" : currentCustomer.data?.firstName || "",
    lastName: hasCustomerError ? "" : currentCustomer?.data?.lastName || "",
    phoneNumber: hasCustomerError
      ? ""
      : currentCustomer?.data?.phoneNumber || "",
    rewardPointsBalance: hasCustomerError
      ? undefined
      : currentCustomer?.data?.rewardPointsBalance,
  };

  const isAuthenticated = !!authToken;

  const filteredPrimaryMenu = ACCOUNT_MENU_PRIMARY.filter(
    (entry) =>
      (checkoutPayEnabled || entry.id !== AccountNavId.Cards) &&
      (hasCustomerServiceData || entry.id !== AccountNavId.CustomerService)
  );
  const filteredSecondaryMenu = hasCustomerServiceData
    ? ACCOUNT_MENU_SECONDARY
    : ACCOUNT_MENU_SECONDARY.filter(
        (entry) => entry.id !== AccountNavId.CustomerService
      ).map((entry) =>
        entry.id === AccountNavId.About
          ? { ...entry, className: cn(entry.className, "mt-2.5") }
          : entry
      );

  return (
    <>
      <AccountTracker />
      <aside
        {...containerProps}
        className={cn(
          "lg:w-98.25 lg:mt-12.5 mt-2.5 flex flex-col gap-2.5 overflow-hidden",
          containerProps?.className
        )}
      >
        {!isAuthenticated && <GuestPanel />}

        {isAuthenticated && (
          <>
            <UserGreetingCard {...customerData} />

            <AccountNavList
              className="lg:rounded-xl"
              entries={filteredPrimaryMenu}
              isProfileComplete={
                hasCustomerError
                  ? undefined
                  : currentCustomer?.data?.isProfileComplete
              }
            />
          </>
        )}

        <AccountNavList className="lg:hidden" entries={filteredSecondaryMenu} />

        {isAuthenticated && <AccountPanelLogOutButton />}

        <AccountPanelFooter />
      </aside>
    </>
  );
};
