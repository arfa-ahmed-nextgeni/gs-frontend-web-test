import { RegionSwitchForm } from "@/components/customer/region/region-switch-form";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { Locale } from "@/lib/constants/i18n";
import { initializePageLocale } from "@/lib/utils/locale";

export default async function RegionPage({
  params,
}: PageProps<"/[locale]/customer/region">) {
  const { locale } = await params;

  initializePageLocale(locale);

  const storeConfigResult = await getStoreConfig({ locale: locale as Locale });

  return (
    <RegionSwitchForm
      localeSwitchOptions={storeConfigResult.data?.localeSwitchOptions ?? []}
    />
  );
}
