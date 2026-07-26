import { routing } from "@/i18n/routing";
import { LanguageCode } from "@/lib/constants/i18n";

export function getCrossDomainLocalePrefix(
  domain: string,
  language: LanguageCode
): string {
  const domainConfig = routing.domains?.find((d) => d.domain === domain);
  const defaultLanguage = domainConfig?.defaultLocale?.split("-")[0];

  return defaultLanguage === language ? "" : `/${language}`;
}
