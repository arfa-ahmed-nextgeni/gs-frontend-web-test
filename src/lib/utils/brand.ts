import {
  NEXT_PUBLIC_DOMAIN_FABIAN,
  NEXT_PUBLIC_DOMAIN_SURRATI,
} from "@/lib/config/client-env";
import { WEBSITE_ID_FABIAN, WEBSITE_ID_SURRATI } from "@/lib/config/server-env";
import { LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";

import type { Locale } from "@/lib/constants/i18n";

export type Brand = "fabian" | "goldenscent" | "surrati";

export const DOMAIN_TO_WEBSITE_ID: Partial<Record<string, number>> = {
  ...(NEXT_PUBLIC_DOMAIN_SURRATI && WEBSITE_ID_SURRATI
    ? { [NEXT_PUBLIC_DOMAIN_SURRATI]: WEBSITE_ID_SURRATI }
    : {}),
  ...(NEXT_PUBLIC_DOMAIN_FABIAN && WEBSITE_ID_FABIAN
    ? { [NEXT_PUBLIC_DOMAIN_FABIAN]: WEBSITE_ID_FABIAN }
    : {}),
};

export function getBrandFromLocale(locale: string): Brand {
  if (locale.includes("SURRATI") || locale.includes("surrati")) {
    return "surrati";
  }
  if (locale.includes("FABIAN") || locale.includes("fabian")) {
    return "fabian";
  }
  return "goldenscent";
}

export function getWebsiteIdFromLocale(locale: string): number | undefined {
  const domain = LOCALE_TO_DOMAIN[locale as Locale];
  if (!domain) return undefined;
  return DOMAIN_TO_WEBSITE_ID[domain];
}
