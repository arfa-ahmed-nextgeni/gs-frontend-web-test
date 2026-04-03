import "server-only";

import { cache } from "react";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { type Locale } from "@/lib/constants/i18n";
import { isBulletEnabledFromStores } from "@/lib/utils/bullet-delivery/eligibility";

export const getBulletDeliveryEnabled = ({ locale }: { locale: Locale }) =>
  getBulletDeliveryEnabledCached(locale);

const getBulletDeliveryEnabledCached = cache(async (locale: Locale) => {
  const storeConfigResult = await getStoreConfig({ locale });

  return isBulletEnabledFromStores(storeConfigResult.data?.store ?? null);
});
