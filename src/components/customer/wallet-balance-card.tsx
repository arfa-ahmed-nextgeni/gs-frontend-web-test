import { ComponentProps } from "react";

import Image from "next/image";

import { getLocale, getTranslations } from "next-intl/server";

import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import CoinsSvg from "@/assets/images/Coins.svg";
import { WalletBalanceCardLink } from "@/components/customer/wallet-balance-card-link";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { CurrencyEnum } from "@/graphql/graphql";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { Locale } from "@/lib/constants/i18n";
import { cn } from "@/lib/utils";

interface WalletBalanceCardProps {
  balance?: {
    currency?: CurrencyEnum | null;
    value?: null | number;
  };
  containerProps?: Omit<ComponentProps<typeof WalletBalanceCardLink>, "href">;
  disableNavigation?: boolean;
  isCompact?: boolean;
}

export const WalletBalanceCard = async ({
  balance,
  containerProps,
  disableNavigation = false,
  isCompact = false,
}: WalletBalanceCardProps) => {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const storeConfigResult = await getStoreConfig({ locale });

  // Only show wallet section if loyalty_rules_effect exists in store config
  const store = storeConfigResult.data?.store;
  if (!store || !store.loyaltyRulesEffect) {
    return null;
  }

  // if (!balance?.value) return null;

  return (
    <WalletBalanceCardLink
      {...containerProps}
      className={containerProps?.className}
      disableNavigation={disableNavigation}
    >
      <div className="flex flex-row">
        <div className="flex flex-col">
          <p className={cn("text-text-primary text-xl font-medium")}>
            {t("WalletBalanceCard.title")}
          </p>
          <LocalizedPrice
            containerProps={{
              className: cn(
                "font-gilroy inline-flex items-center font-medium text-text-primary"
              ),
            }}
            currencySymbolProps={{
              className: "text-[40px]",
            }}
            price={`${balance?.value || 0} ${balance?.currency || CurrencyEnum.Sar}`}
            valueProps={{
              className: "text-[75px]",
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Image
          alt="coins decoration"
          className="object-contain opacity-80"
          height={133}
          src={CoinsSvg}
          unoptimized
          width={133}
        />
        {!disableNavigation && (
          <Image
            alt="arrow right"
            className="object-contain rtl:rotate-180"
            height={isCompact ? 16 : 20}
            src={ArrowRightIcon}
            width={isCompact ? 16 : 20}
          />
        )}
      </div>
    </WalletBalanceCardLink>
  );
};
