"use client";

import { useTranslations } from "next-intl";

import GiftIcon from "@/assets/icons/gift-icon.svg";
import TabbyIcon from "@/assets/icons/tabby-icon.svg";
import TamaraArIcon from "@/assets/icons/tamara-ar-icon.svg";
import TamaraIcon from "@/assets/icons/tamara-icon.svg";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { Card, CardContent } from "@/components/ui/card";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useOrderLocaleAssets } from "@/hooks/i18n/use-order-locale-assets";
import { formatPrice } from "@/lib/utils/price";

import { Icon, PerkItem, PerkList } from "./order-summary-helpers";

interface OrderPerksProps {
  currencyCode: string;
  grandTotal: number;
}

export function OrderPerks({ currencyCode, grandTotal }: OrderPerksProps) {
  const t = useTranslations("CartPage.orderSummary");
  const { storeConfig } = useStoreConfig();
  const { language, walletIcon } = useOrderLocaleAssets();

  const localizeStyle = {
    className: "ms-0.75",
  };

  const cashbackPercent = storeConfig?.cashbackPercent || 0.05;
  const tamaraInstallments = storeConfig?.tamaraInstallments?.installments || 4;

  const cashbackAmount = grandTotal * cashbackPercent;
  const installmentAmount = grandTotal / tamaraInstallments;

  return (
    <Card className="bg-(--color-bg-default) mt-3 overflow-hidden rounded-xl border-0 px-1.5 py-0 shadow-none">
      <CardContent className="p-0">
        <PerkList>
          <PerkItem
            label={t.rich("perks.cashback", {
              amount: () => (
                <LocalizedPrice
                  currencySymbolProps={localizeStyle}
                  price={String(
                    formatPrice({ amount: cashbackAmount, currencyCode })
                  )}
                />
              ),
              b: (chunks: any) => <b>{chunks}</b>,
            })}
            right={<Icon className="size-5.5" size={22} src={walletIcon} />}
          />
          <PerkItem
            label={t("perks.giftWrap")}
            right={<Icon className="size-5.5" size={22} src={GiftIcon} />}
          />
          {storeConfig?.tamaraInstallments?.enabled && (
            <PerkItem
              label={t.rich("perks.installments", {
                amount: () => (
                  <LocalizedPrice
                    currencySymbolProps={localizeStyle}
                    price={String(
                      formatPrice({ amount: installmentAmount, currencyCode })
                    )}
                  />
                ),
                b: (chunks: any) => <b>{chunks}</b>,
              })}
              right={
                <div className="flex flex-col items-center gap-0.5">
                  <Icon className="size-7" size={28} src={TabbyIcon} />
                  <Icon
                    className="size-7.5"
                    size={30}
                    src={language === "en" ? TamaraIcon : TamaraArIcon}
                  />
                </div>
              }
            />
          )}
        </PerkList>
      </CardContent>
    </Card>
  );
}
