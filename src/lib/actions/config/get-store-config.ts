import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import { getStoresConfig } from "@/lib/actions/config/get-stores-config";
import { CacheTags } from "@/lib/constants/cache/tags";
import { Locale } from "@/lib/constants/i18n";
import { Stores } from "@/lib/models/stores";
import { getStoreCode } from "@/lib/utils/country";
import { buildLocaleSwitchOptions } from "@/lib/utils/locale";
import { ok } from "@/lib/utils/service-result";

import type { Store } from "@/lib/models/stores";
import type { LocaleSwitchOption } from "@/lib/types/store-config";

const lastSuccessfulStoreConfigByLocale = new Map<
  Locale,
  { localeSwitchOptions: LocaleSwitchOption[]; store: Store }
>();

const getPreviousStoreConfig = (locale: Locale) => {
  const previousConfig = lastSuccessfulStoreConfigByLocale.get(locale);

  if (!previousConfig) {
    return null;
  }

  return {
    localeSwitchOptions: structuredClone(previousConfig.localeSwitchOptions),
    store: structuredClone(previousConfig.store),
  };
};

const DEFAULT_STORE_CONFIG = { localeSwitchOptions: [], store: null };

export const getStoreConfig = ({ locale }: { locale: Locale }) =>
  getStoreConfigCached(locale);

const getStoreConfigCached = cache(async (locale: Locale) => {
  "use cache";
  cacheTag(CacheTags.Magento);

  try {
    const storesConfigResult = await getStoresConfig();

    if (!storesConfigResult.data) {
      const previousConfig = getPreviousStoreConfig(locale);

      if (previousConfig) {
        return ok(previousConfig);
      }

      return ok(DEFAULT_STORE_CONFIG);
    }

    const stores = new Stores(storesConfigResult.data);
    const store = structuredClone(
      stores.getByCode(getStoreCode(locale as Locale))
    );
    const localeSwitchOptions = buildLocaleSwitchOptions(stores.getAll());

    if (!store) {
      return ok(DEFAULT_STORE_CONFIG);
    }

    const successfulConfig = { localeSwitchOptions, store };
    lastSuccessfulStoreConfigByLocale.set(locale, successfulConfig);

    return ok(successfulConfig);
  } catch {
    console.error("Error fetching store config: ", locale);
    const previousConfig = getPreviousStoreConfig(locale);

    if (previousConfig) {
      return ok(previousConfig);
    }

    return ok(DEFAULT_STORE_CONFIG);
  }
});
