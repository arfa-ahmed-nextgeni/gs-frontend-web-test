"use client";

import { useTranslations } from "next-intl";

import { LocalizedPrice } from "@/components/shared/localized-price";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/price";

import { Row } from "./order-summary-helpers";

interface OrderSummaryProps {
  baseShippingFee: number;
  currencyCode: string;
  freeShippingThreshold: number;
  grandTotal: number;
  mokafaaDiscount: number;
  rewardPointsValue?: number;
  serviceFee: number;
  shippingFee: number;
  subTotal: number;
}

export function OrderSummary({
  baseShippingFee,
  currencyCode,
  freeShippingThreshold,
  grandTotal,
  mokafaaDiscount,
  rewardPointsValue,
  serviceFee,
  shippingFee,
  subTotal,
}: OrderSummaryProps) {
  const t = useTranslations("CartPage.orderSummary");

  const remaining = Math.max(freeShippingThreshold - subTotal, 0);
  const freeShippingUnlocked = remaining === 0 && freeShippingThreshold > 0;

  const renderPrice = (amount: number) => (
    <LocalizedPrice price={String(formatPrice({ amount, currencyCode }))} />
  );

  return (
    <Card className="bg-(--color-bg-default) pt-7.5 gap-3 rounded-xl border-0 pb-5 shadow-none">
      <CardHeader>
        <CardTitle className="text-(--color-text-primary) p-0 px-1 text-[25px] font-semibold tracking-tight">
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-0">
        <div className="text-(--color-text-primary) space-y-2 text-sm">
          <Row label={t("subtotal")} value={renderPrice(subTotal)} />
          {serviceFee ? (
            <Row label={t("serviceFee")} value={renderPrice(serviceFee)} />
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-(--color-text-primary)">
              {t("shippingFee")}
            </span>
            <span className="font-gilroy flex items-center gap-2 text-sm">
              {freeShippingUnlocked ? (
                <div className="flex items-center gap-1">
                  <LocalizedPrice
                    containerProps={{
                      className:
                        "flex font-gilroy items-center text-text-secondary text-xs",
                    }}
                    price={String(
                      formatPrice({
                        amount: baseShippingFee || shippingFee,
                        currencyCode,
                      })
                    )}
                    valueProps={{ className: "line-through" }}
                  />
                  <span className="text-btn-bg-teal">{t("free")}</span>
                </div>
              ) : (
                renderPrice(shippingFee)
              )}
            </span>
          </div>

          {freeShippingThreshold > 0 && freeShippingUnlocked && (
            <div className="bg-label-accent-light text-text-primary flex justify-center gap-1 rounded-[5px] py-2 text-xs font-normal">
              {t.rich("freeDeliverySuccess", {
                b: (chunks: any) => (
                  <span className="font-semibold rtl:font-bold">{chunks}</span>
                ),
              })}
            </div>
          )}

          {mokafaaDiscount > 0 && (
            <Row
              label={t("rajhiMokafaa")}
              value={
                <span className="text-btn-bg-teal">
                  <LocalizedPrice
                    price={`-${formatPrice({
                      amount: mokafaaDiscount,
                      currencyCode,
                    })}`}
                  />
                </span>
              }
            />
          )}

          {rewardPointsValue && rewardPointsValue > 0 && (
            <Row
              label={t("walletBalance")}
              value={
                <span className="text-btn-bg-teal">
                  <LocalizedPrice
                    price={`-${formatPrice({
                      amount: rewardPointsValue,
                      currencyCode,
                    })}`}
                  />
                </span>
              }
            />
          )}

          <div className="border-border-base my-5 border-t" />
          <Row
            bold
            label={t("grandTotal")}
            labelClass="capitalize"
            value={renderPrice(grandTotal)}
            valueClass="text-text-tertiary text-sm font-semibold font-gilroy"
          />
        </div>
      </CardContent>
    </Card>
  );
}
