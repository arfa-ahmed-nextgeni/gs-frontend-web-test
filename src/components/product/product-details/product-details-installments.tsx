"use client";

import React from "react";

import { useTranslations } from "next-intl";

import { TabbyPromoDialog } from "@/components/product/product-details/product-promo-dialog/tabby-promo-dialog";
import { TamaraPromoDialog } from "@/components/product/product-details/product-promo-dialog/tamara-promo-dialog";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useProductDetails } from "@/contexts/product-details-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { formatPrice } from "@/lib/utils/price";

export const ProductDetailsInstallments = () => {
  const t = useTranslations("ProductPage.installmensts");

  const { storeConfig } = useStoreConfig();
  const { product, selectedVariantIndex } = useProductDetails();

  const tabbyEnabled = storeConfig?.tabbyInstallments.enabled;
  const tamaraEnabled = storeConfig?.tamaraInstallments.enabled;

  if (!tabbyEnabled && !tamaraEnabled) return null;

  const priceValue =
    product.variants[selectedVariantIndex]?.priceValue ||
    product.priceValue ||
    0;

  const installmentCount = storeConfig?.tamaraInstallments.installments ?? 1;
  const installmentPriceValue = priceValue / installmentCount;

  const installmentPrice = formatPrice({
    amount: installmentPriceValue,
    currencyCode: storeConfig.currencyCode,
    options: { maximumFractionDigits: 2 },
  });

  const widgetOrder = storeConfig?.installmentsWidgetSorting ?? [];

  const renderWidget = (provider: string) => {
    switch (provider) {
      case "tabby":
        return (
          <TabbyPromoDialog
            currency={storeConfig.currencyCode}
            key="tabby"
            price={priceValue}
          />
        );
      case "tamara":
        return <TamaraPromoDialog key="tamara" price={priceValue} />;
      default:
        return null;
    }
  };

  const enabledProviders = widgetOrder.filter((p) =>
    p === "tabby" ? tabbyEnabled : p === "tamara" ? tamaraEnabled : false
  );

  return (
    <div className="bg-bg-default overflow-hidden rounded-[10px]">
      {installmentPrice && (
        <div className="border-border-base text-text-primary flex h-11 items-center justify-center border-b text-sm font-medium leading-none">
          <span className="text-center">
            {t.rich("message", {
              price: () => (
                <span className="text-text-brand">
                  <LocalizedPrice price={installmentPrice} />
                </span>
              ),
            })}
          </span>
        </div>
      )}

      <div className="flex h-12 flex-row">
        {enabledProviders.map((provider, idx) => (
          <React.Fragment key={provider}>
            <div className="flex flex-1 items-center justify-center">
              {renderWidget(provider)}
            </div>
            {idx < enabledProviders.length - 1 && (
              <div className="flex w-12 items-center justify-center">
                <span className="w-0.25 border-border-base h-8 border" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
