"use client";

import { useSearchParams } from "next/navigation";

import { useLocale } from "next-intl";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { Link, usePathname } from "@/i18n/navigation";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";
import { trackChangeStore, trackLanguagePick } from "@/lib/analytics/events";
import { PROTOCOL } from "@/lib/constants/environment";
import {
  COUNTRY_CODE_TO_NAME,
  LanguageCode,
  STORE_TO_LOCALE,
} from "@/lib/constants/i18n";
import { LocaleSwitchOption } from "@/lib/types/store-config";
import { cn } from "@/lib/utils";
import { getCrossDomainLocalePrefix } from "@/lib/utils/cross-domain-locale";

export const LanguageSwitcherLinks = ({
  currentLocaleDomain,
  localeSwitchOption,
}: {
  currentLocaleDomain: string;
  localeSwitchOption: LocaleSwitchOption;
}) => {
  const locale = useLocale();
  const { language, region } = useLocaleInfo();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { storeConfig } = useStoreConfig();

  const searchParamsString = searchParams.toString();

  const isSameDomain = currentLocaleDomain === localeSwitchOption.domain;

  const handleLanguageClick = (selectedLanguage: LanguageCode) => {
    if (isSameDomain) {
      trackLanguagePick({
        country: COUNTRY_CODE_TO_NAME[region],
        Language: selectedLanguage,
      });
    } else {
      trackChangeStore(
        storeConfig?.code || locale,
        selectedLanguage === LanguageCode.AR
          ? (localeSwitchOption?.arStoreCode ?? "")
          : (localeSwitchOption?.enStoreCode ?? "")
      );
      invalidateSession();
    }
  };

  const enHref = `${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;
  const arHref = `${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;
  // Prefix comes from the target domain's default locale (next-intl `as-needed`),
  // so the default language stays prefix-less (e.g. Arabic -> `/`, not `/ar`)
  // instead of 301-redirecting.
  const enPrefix = getCrossDomainLocalePrefix(
    localeSwitchOption.domain,
    LanguageCode.EN
  );
  const arPrefix = getCrossDomainLocalePrefix(
    localeSwitchOption.domain,
    LanguageCode.AR
  );
  const enFullUrl = `${PROTOCOL}://${localeSwitchOption.domain}${enPrefix}${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;
  const arFullUrl = `${PROTOCOL}://${localeSwitchOption.domain}${arPrefix}${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;

  return (
    <>
      {isSameDomain ? (
        <Link
          className={cn(
            "font-gilroy text-text-primary bg-bg-default h-auto rounded-l-md px-1 py-0.5 text-xs font-medium",
            { "bg-label-muted-bg rounded-md": language === "en" }
          )}
          href={enHref}
          locale={STORE_TO_LOCALE[localeSwitchOption.enStoreCode]}
          onClick={() => handleLanguageClick(LanguageCode.EN)}
          title={`Switch to English - ${COUNTRY_CODE_TO_NAME[localeSwitchOption.code]}`}
        >
          Eng
        </Link>
      ) : (
        <a
          className={cn(
            "font-gilroy text-text-primary bg-bg-default h-auto rounded-l-md px-1 py-0.5 text-xs font-medium",
            { "bg-label-muted-bg rounded-md": language === "en" }
          )}
          href={enFullUrl}
          onClick={() => handleLanguageClick(LanguageCode.EN)}
          title={`Switch to English - ${COUNTRY_CODE_TO_NAME[localeSwitchOption.code]}`}
        >
          Eng
        </a>
      )}
      {isSameDomain ? (
        <Link
          className={cn(
            "font-cairo text-text-primary bg-bg-default h-auto rounded-e-md px-1 py-0.5 text-xs font-medium",
            { "bg-label-muted-bg rounded-md": language === "ar" }
          )}
          href={arHref}
          locale={STORE_TO_LOCALE[localeSwitchOption.arStoreCode]}
          onClick={() => handleLanguageClick(LanguageCode.AR)}
          title={`التبديل إلى العربية - ${COUNTRY_CODE_TO_NAME[localeSwitchOption.code]}`}
        >
          عربي
        </Link>
      ) : (
        <a
          className={cn(
            "font-cairo text-text-primary bg-bg-default h-auto rounded-e-md px-1 py-0.5 text-xs font-medium",
            { "bg-label-muted-bg rounded-md": language === "ar" }
          )}
          href={arFullUrl}
          onClick={() => handleLanguageClick(LanguageCode.AR)}
          title={`التبديل إلى العربية - ${COUNTRY_CODE_TO_NAME[localeSwitchOption.code]}`}
        >
          عربي
        </a>
      )}
    </>
  );
};
