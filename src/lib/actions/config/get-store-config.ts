import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import { getStoresConfig } from "@/lib/actions/config/get-stores-config";
import { CacheTags } from "@/lib/constants/cache/tags";
import {
  CountryCode,
  LanguageCode,
  Locale,
  LOCALE_TO_DOMAIN,
  StoreCode,
} from "@/lib/constants/i18n";
import { Store, Stores } from "@/lib/models/stores";
import { getBrandFromLocale, getWebsiteIdFromLocale } from "@/lib/utils/brand";
import { getStoreCode } from "@/lib/utils/country";
import { buildLocaleSwitchOptions } from "@/lib/utils/locale";
import { ok } from "@/lib/utils/service-result";

import type { LocaleSwitchOption } from "@/lib/types/store-config";
import type { Brand } from "@/lib/utils/brand";

const BRAND_STORE_CODES: Record<
  Exclude<Brand, "goldenscent">,
  { ar: StoreCode; en: StoreCode }
> = {
  fabian: { ar: StoreCode.ar_fabian, en: StoreCode.en_fabian },
  surrati: { ar: StoreCode.ar_surrati, en: StoreCode.en_surrati },
};

function buildBrandLocaleSwitchOption(
  brand: Exclude<Brand, "goldenscent">,
  locale: Locale
): LocaleSwitchOption {
  const codes = BRAND_STORE_CODES[brand];
  return {
    arLocale: LanguageCode.AR,
    arStoreCode: codes.ar,
    code: CountryCode.Saudi,
    domain: LOCALE_TO_DOMAIN[locale],
    enLocale: LanguageCode.EN,
    enStoreCode: codes.en,
  };
}

const DEFAULT_STORE_CONFIG = { localeSwitchOptions: [], store: null };

// Minimal store used when the Magento store config API is unreachable for brand
// domains. Provides the store view code so the catalog service API call is still
// made with the correct Magento-Store-View-Code header.
const BRAND_FALLBACK_STORE_CURRENCY = "SAR";
const BRAND_FALLBACK_COUNTRY_CODE = "SA";

function buildBrandFallbackStore(locale: Locale): Store {
  return new Store({
    code: getStoreCode(locale),
    countryCode: BRAND_FALLBACK_COUNTRY_CODE,
    currencyCode: BRAND_FALLBACK_STORE_CURRENCY,
    id: "",
    storeCode: "",
    websiteCode: "",
  });
}

function getDefaultStoreConfig(locale: Locale) {
  const brand = getBrandFromLocale(locale);
  if (brand !== "goldenscent") {
    return {
      localeSwitchOptions: [buildBrandLocaleSwitchOption(brand, locale)],
      store: structuredClone(buildBrandFallbackStore(locale)),
    };
  }
  return DEFAULT_STORE_CONFIG;
}

export const getStoreConfig = ({ locale }: { locale: Locale }) => {
  const websiteId = getWebsiteIdFromLocale(locale);
  return getStoreConfigCached(locale, websiteId);
};

const getStoreConfigCached = cache(
  async (locale: Locale, websiteId?: number) => {
    "use cache";
    cacheTag(CacheTags.Magento, CacheTags.StoreConfig);

    try {
      const storesConfigResult = await getStoresConfig(websiteId);

      if (!storesConfigResult.data?.[0]?.stores) {
        return ok(getDefaultStoreConfig(locale));
      }

      const stores = new Stores(storesConfigResult.data);
      const store = structuredClone(
        stores.getByCode(getStoreCode(locale as Locale))
      );

      if (!store) {
        return ok(getDefaultStoreConfig(locale));
      }

      // Brand domains (Surrati, Fabian) always have exactly EN+AR on their own
      // domain. Magento returns countryCode "SA" for these stores which would
      // make buildLocaleSwitchOptions point to the GS Saudi domain. Build the
      // option directly from known constants instead.
      const brand = getBrandFromLocale(locale);
      const localeSwitchOptions =
        brand !== "goldenscent"
          ? [buildBrandLocaleSwitchOption(brand, locale)]
          : buildLocaleSwitchOptions(stores.getAll());

      return ok({ localeSwitchOptions, store });
    } catch (error) {
      console.error(
        "Error fetching store config: ",
        locale,
        JSON.stringify(error)
      );

      return ok(getDefaultStoreConfig(locale));
    }
  }
);
