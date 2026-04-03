"use client";

import { useTranslations } from "next-intl";

import DirhamCoinIcon from "@/assets/icons/dirham-coin-icon.svg";
import DollarCoinIcon from "@/assets/icons/dollar-coin-icon.svg";
import GiftIcon from "@/assets/icons/gift-icon.svg";
import RiyalIcon from "@/assets/icons/riyal-icon.svg";
import TabbyIcon from "@/assets/icons/tabby-icon.svg";
import TamaraArIcon from "@/assets/icons/tamara-ar-icon.svg";
import TamaraIcon from "@/assets/icons/tamara-icon.svg";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { Card, CardContent } from "@/components/ui/card";
import { useStoreConfig } from "@/contexts/store-config-context";
import { formatPrice } from "@/lib/utils/price";

import { Icon, PerkItem, PerkList } from "./order-summary-helpers";

interface OrderPerksProps {
  currencyCode: string;
  grandTotal: number;
}

export function OrderPerks({ currencyCode, grandTotal }: OrderPerksProps) {
  const t = useTranslations("CartPage.orderSummary");
  const { storeConfig } = useStoreConfig();
  const code = storeConfig?.code;
  const locale = storeConfig?.locale;

  const lang = locale?.startsWith("ar") ? "ar" : "en";
  const store = code?.endsWith("sa")
    ? "sa"
    : code?.endsWith("ae")
      ? "ae"
      : "other";

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
                  price={String(
                    formatPrice({ amount: cashbackAmount, currencyCode })
                  )}
                />
              ),
              b: (chunks: any) => <b>{chunks}</b>,
            })}
            right={
              <Icon
                size={22}
                src={
                  store === "sa"
                    ? RiyalIcon
                    : store === "ae"
                      ? DirhamCoinIcon
                      : DollarCoinIcon
                }
              />
            }
          />
          <PerkItem
            label={t("perks.giftWrap")}
            right={<Icon size={22} src={GiftIcon} />}
          />
          {storeConfig?.tamaraInstallments?.enabled && (
            <PerkItem
              label={t.rich("perks.installments", {
                amount: () => (
                  <LocalizedPrice
                    price={String(
                      formatPrice({ amount: installmentAmount, currencyCode })
                    )}
                  />
                ),
                b: (chunks: any) => <b>{chunks}</b>,
              })}
              right={
                <div className="flex flex-col items-center gap-0.5">
                  <Icon size={28} src={TabbyIcon} />
                  <Icon
                    size={30}
                    src={lang === "en" ? TamaraIcon : TamaraArIcon}
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
