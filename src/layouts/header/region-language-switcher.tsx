import Image from "next/image";

import { getLocale, getTranslations } from "next-intl/server";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { ArrowDownIcon } from "@/components/icons/arrow-down-icon";
import { BlurDiv } from "@/components/ui/blur-div";
import { LanguageSwitcherLinks } from "@/layouts/header/language-switcher-links";
import { LanguageSwitcherLinksSkeleton } from "@/layouts/header/language-switcher-links-skeleton";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import {
  COUNTRY_CODE_TO_FLAG,
  COUNTRY_CODE_TO_NAME,
  CountryCode,
  Locale,
  LOCALE_TO_DOMAIN,
} from "@/lib/constants/i18n";
import { ZIndexLevel } from "@/lib/constants/ui";
import { LocaleSwitchOption } from "@/lib/types/store-config";
import { cn } from "@/lib/utils";
import { getLocaleInfo } from "@/lib/utils/locale";

export async function RegionLanguageSwitcher({
  hoverZIndexLevel,
}: {
  hoverZIndexLevel: ZIndexLevel;
}) {
  const locale = (await getLocale()) as Locale;

  let localeSwitchOptions: LocaleSwitchOption[] = [];

  const storeConfigResult = await getStoreConfig({ locale });

  if (storeConfigResult.data.localeSwitchOptions.length) {
    localeSwitchOptions = storeConfigResult.data.localeSwitchOptions;
  }

  const { language, region } = getLocaleInfo(locale as string);

  const t = await getTranslations("HomePage.header.countryNames");

  const selectedLocaleSwitchOption = localeSwitchOptions.find(
    (localeSwitchOption) => localeSwitchOption.code === region
  );

  return (
    <BlurDiv className="group relative" hoverLevel={hoverZIndexLevel}>
      <div className="flex h-full items-center justify-center">
        <div className="rounded-4xl bg-bg-surface flex h-10 items-center justify-between gap-2 px-5">
          {selectedLocaleSwitchOption?.code &&
            COUNTRY_CODE_TO_FLAG[selectedLocaleSwitchOption.code] && (
              <Image
                alt={`${COUNTRY_CODE_TO_NAME[selectedLocaleSwitchOption.code as CountryCode]}`}
                height={15}
                src={COUNTRY_CODE_TO_FLAG[selectedLocaleSwitchOption.code]}
                unoptimized
                width={20}
              />
            )}
          <span className="text-text-primary">
            {language === "ar" ? "عربي" : "Eng"}
          </span>
          <ArrowDownIcon className="transition-default group-hover:rotate-180" />
        </div>
      </div>

      <div className="group/list rounded-t-0 transition-default bg-bg-default absolute start-0 top-[var(--desktop-header-height)] max-h-0 w-[240px] overflow-hidden rounded-b-xl rounded-t-none border-0 group-hover:max-h-80">
        {localeSwitchOptions.map((localeSwitchOption) => {
          const isDefaultSelected =
            selectedLocaleSwitchOption &&
            localeSwitchOption.code === selectedLocaleSwitchOption.code;
          const currentLocaleDomain =
            LOCALE_TO_DOMAIN[locale as keyof typeof LOCALE_TO_DOMAIN];

          return (
            <div
              className={cn(
                "border-border-base transition-default group/item hover:bg-bg-surface flex flex-row items-center justify-between border-b px-4 py-2 last:border-none",
                "hover:pl-6 hover:pr-4 rtl:hover:pl-4 rtl:hover:pr-6",
                isDefaultSelected &&
                  "bg-bg-surface group-hover/list:bg-bg-default ps-6",
                isDefaultSelected &&
                  "group-hover/list:pl-4 rtl:group-hover/list:pr-4"
              )}
              key={localeSwitchOption.code}
            >
              <div className="flex items-center gap-2">
                <Image
                  alt="flag"
                  className="h-3.75 w-5"
                  height={15}
                  src={COUNTRY_CODE_TO_FLAG[localeSwitchOption.code]}
                  unoptimized
                  width={20}
                />
                <span className="text-text-primary text-sm font-medium">
                  {t.has(localeSwitchOption.code as any)
                    ? t(localeSwitchOption.code as any)
                    : localeSwitchOption.code}
                </span>
              </div>
              <div
                className={cn(
                  "transition-default bg-bg-default invisible flex flex-row rounded-md opacity-0 group-hover/item:visible group-hover/item:opacity-100",
                  isDefaultSelected &&
                    "visible opacity-100 group-hover/item:!visible group-hover/list:invisible group-hover/item:!opacity-100 group-hover/list:opacity-0"
                )}
                dir="ltr"
              >
                <AsyncBoundary
                  fallback={
                    <LanguageSwitcherLinksSkeleton language={language} />
                  }
                >
                  <LanguageSwitcherLinks
                    currentLocaleDomain={currentLocaleDomain}
                    localeSwitchOption={localeSwitchOption}
                  />
                </AsyncBoundary>
              </div>
            </div>
          );
        })}
      </div>
    </BlurDiv>
  );
}
