import { useLocale } from "next-intl";

import { getLocaleInfo } from "@/lib/utils/locale";

export const useLocaleInfo = () => {
  const locale = useLocale();

  return getLocaleInfo(locale as string);
};
