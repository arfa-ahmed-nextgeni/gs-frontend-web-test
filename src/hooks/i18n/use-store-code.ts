import { useLocale } from "next-intl";

import { GLOBAL_STORES, Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";

export const useStoreCode = () => {
  const locale = useLocale();

  const storeCode = LOCALE_TO_STORE[locale as Locale];

  const isGlobal = GLOBAL_STORES.includes(storeCode);

  return { isGlobal, storeCode };
};
