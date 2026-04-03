import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { getLocaleInfo } from "@/lib/utils/locale";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const { language } = getLocaleInfo(locale);

  return {
    locale,
    messages: (await import(`../../messages/${language}.json`)).default,
  };
});
