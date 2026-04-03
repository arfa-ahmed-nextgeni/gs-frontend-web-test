import { useLocale } from "next-intl";

import { Locale, LOCALE_TO_TIMEZONE } from "@/lib/constants/i18n";

export const useStoreTimezone = () => {
  const locale = useLocale();

  return LOCALE_TO_TIMEZONE[locale as Locale];
};
