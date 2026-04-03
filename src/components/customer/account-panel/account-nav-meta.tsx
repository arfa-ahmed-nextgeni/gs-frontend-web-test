"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import { AccountNavId } from "@/components/customer/account-panel/account-menu.config";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import {
  COUNTRY_CODE_TO_FLAG,
  COUNTRY_CODE_TO_NAME,
  CountryCode,
} from "@/lib/constants/i18n";
import { cn } from "@/lib/utils";

export const AccountNavMeta = ({
  id,
  isProfileComplete,
}: {
  id: AccountNavId;
  isProfileComplete?: boolean;
}) => {
  const t = useTranslations("AccountPage.menu");

  const { language, region } = useLocaleInfo();

  const isArabic = language === "ar";

  switch (id) {
    case AccountNavId.Country:
      return (
        <Image
          alt={`${COUNTRY_CODE_TO_NAME[region as CountryCode]}`}
          height={20}
          src={COUNTRY_CODE_TO_FLAG[region as CountryCode]}
          unoptimized
          width={26}
        />
      );
    case AccountNavId.Profile:
      if (!isProfileComplete) {
        return (
          <div className="text-text-secondary text-xs font-normal lg:hidden">
            {t("profileSubtitle")}
          </div>
        );
      }
      return null;
    case AccountNavId.SwitchLanguage:
      return (
        <div
          className={cn(
            "text-text-primary text-xl font-medium",
            isArabic ? "font-cairo" : "font-gilroy"
          )}
        >
          {isArabic ? "العربية" : "English"}
        </div>
      );
    default:
      return null;
  }
};
