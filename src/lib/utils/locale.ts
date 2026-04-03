import { notFound } from "next/navigation";

import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import {
  COUNTRY_CODE_TO_DOMAIN,
  CountryCode,
  LanguageCode,
} from "@/lib/constants/i18n";
import { Store } from "@/lib/models/stores";
import { LocaleSwitchOption } from "@/lib/types/store-config";

export function buildLocaleSwitchOptions(stores: Store[]) {
  const groups = new Map<string, { ar?: Store; en?: Store }>();

  for (const store of stores) {
    const country = store.regionCode.toUpperCase();
    const lang = store.code.split("_")[0];
    const entry = groups.get(country) ?? {};
    if (lang === "ar") entry.ar = store;
    if (lang === "en") entry.en = store;
    groups.set(country, entry);
  }

  const result: Array<LocaleSwitchOption> = [];

  for (const [country, pair] of groups) {
    if (!pair?.ar || !pair?.en) continue;

    const domain = COUNTRY_CODE_TO_DOMAIN[country as CountryCode];

    result.push({
      arLocale: LanguageCode.AR,
      arStoreCode: pair.ar.code,
      code: country as CountryCode,
      domain,
      enLocale: LanguageCode.EN,
      enStoreCode: pair.en.code,
    });
  }

  return result;
}

export function getLocaleInfo(locale?: string) {
  if (!locale) {
    return { language: LanguageCode.EN, region: CountryCode.Saudi };
  }

  try {
    const intlLocale = new Intl.Locale(locale);
    const language = intlLocale.language;
    const region = intlLocale.region;

    if (!region) {
      const parts = locale.split("-");

      return {
        language: parts[0] || LanguageCode.EN,
        region: parts[1] || CountryCode.Saudi,
      };
    }

    return { language, region };
  } catch (error) {
    console.error("getLocaleInfo error: ", { error, locale });

    const parts = locale.split("-");

    return {
      language: parts[0] || LanguageCode.EN,
      region: parts[1] || CountryCode.Saudi,
    };
  }
}

export function initializePageLocale(locale: string) {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
}
