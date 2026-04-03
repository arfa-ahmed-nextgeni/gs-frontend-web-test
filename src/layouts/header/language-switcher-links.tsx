"use client";

import { useSearchParams } from "next/navigation";

import { useLocale } from "next-intl";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { Link, usePathname } from "@/i18n/navigation";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";
import { trackChangeStore, trackLanguagePick } from "@/lib/analytics/events";
import { PROTOCOL } from "@/lib/constants/environment";
import { COUNTRY_CODE_TO_NAME, LanguageCode } from "@/lib/constants/i18n";
import { LocaleSwitchOption } from "@/lib/types/store-config";
import { cn } from "@/lib/utils";

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
  const enFullUrl = `${PROTOCOL}://${localeSwitchOption.domain}/${localeSwitchOption.enLocale}${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;
  const arFullUrl = `${PROTOCOL}://${localeSwitchOption.domain}/${localeSwitchOption.arLocale}${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;

  return (
    <>
      {isSameDomain ? (
        <Link
          className={cn(
            "font-gilroy text-text-primary bg-bg-default h-auto rounded-l-md px-1 py-0.5 text-xs font-medium",
            { "bg-label-muted-bg rounded-md": language === "en" }
          )}
          href={enHref}
          locale={localeSwitchOption.enLocale}
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
          locale={localeSwitchOption.arLocale}
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
