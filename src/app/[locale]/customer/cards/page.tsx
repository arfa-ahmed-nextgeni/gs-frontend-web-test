import { notFound } from "next/navigation";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { CustomerPaymentCardsList } from "@/components/customer/cards/customer-payment-cards-list";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { Locale } from "@/lib/constants/i18n";
import { initializePageLocale } from "@/lib/utils/locale";

import CustomerCardsLoading from "./loading";

export default async function CustomerCardsPage({
  params,
}: PageProps<"/[locale]/customer/cards">) {
  const { locale } = await params;

  initializePageLocale(locale);

  const storeConfigResult = await getStoreConfig({ locale: locale as Locale });
  const checkoutPayEnabled = storeConfigResult.data?.store?.checkoutPayEnabled;

  if (!checkoutPayEnabled) {
    notFound();
  }

  return (
    <AsyncBoundary fallback={<CustomerCardsLoading />}>
      <div className="lg:mt-12.5 mt-2.5 flex flex-col gap-2.5 px-5 lg:px-0">
        <CustomerPaymentCardsList />
      </div>
    </AsyncBoundary>
  );
}
