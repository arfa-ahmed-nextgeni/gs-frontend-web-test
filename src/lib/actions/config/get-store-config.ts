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

const DEFAULT_STORE_CONFIG = { localeSwitchOptions: [], store: null };

export const getStoreConfig = ({ locale }: { locale: Locale }) =>
  getStoreConfigCached(locale);

const getStoreConfigCached = cache(async (locale: Locale) => {
  "use cache";
  cacheTag(CacheTags.Magento, CacheTags.StoreConfig);

  try {
    const storesConfigResult = await getStoresConfig();

    if (!storesConfigResult.data?.[0]?.stores) {
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

    return ok({ localeSwitchOptions, store });
  } catch (error) {
    console.error(
      "Error fetching store config: ",
      locale,
      JSON.stringify(error)
    );

    return ok(DEFAULT_STORE_CONFIG);
  }
});
