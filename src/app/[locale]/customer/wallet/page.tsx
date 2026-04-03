import { connection } from "next/server";

import { getLocale } from "next-intl/server";

import { loadWalletSearchParams } from "@/app/[locale]/customer/wallet/search-params";
import { WalletPageContent } from "@/components/customer/wallet/wallet-page-content";
import { redirect } from "@/i18n/navigation";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { getCustomerWalletBalance } from "@/lib/actions/customer/get-customer-wallet-balance";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";

export default async function WalletPage({
  searchParams,
}: PageProps<"/[locale]/customer/wallet">) {
  await connection();

  const locale = (await getLocale()) as Locale;
  const storeConfigResult = await getStoreConfig({ locale });

  // Redirect to account page if loyalty_rules_effect doesn't exist in store config
  const store = storeConfigResult.data?.store;
  if (!store || !store.loyaltyRulesEffect) {
    redirect({
      href: ROUTES.CUSTOMER.ACCOUNT,
      locale,
    });
  }

  const { page, tab } = await loadWalletSearchParams(searchParams);
  const walletBalance = await getCustomerWalletBalance();

  return (
    <WalletPageContent
      balance={walletBalance.data?.balance?.money}
      page={page}
      tab={tab}
    />
  );
}
