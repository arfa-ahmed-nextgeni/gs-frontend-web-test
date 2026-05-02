"use client";

import { useTranslations } from "next-intl";

import RiyalCoinImage from "@/assets/images/riyal-coin.svg";
import { CashbackDialog } from "@/components/dialogs/cashback-dialog";
import { CashbackDialogContent as CashbackDialogBody } from "@/components/dialogs/cashback-dialog-content";
import { ProductDetailBadge } from "@/components/product/product-details/product-details-badge";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useProductDetails } from "@/contexts/product-details-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { formatPrice } from "@/lib/utils/price";

import type { CashbackDialogContent as CashbackDialogContentData } from "@/lib/types/contentful/pdp-dialog-config";

export const ProductDetailsCashbackBadge = ({
  content,
}: {
  content?: CashbackDialogContentData;
}) => {
  const t = useTranslations("ProductPage.badges");

  const { storeConfig } = useStoreConfig();
  const { selectedProduct } = useProductDetails();

  const priceValue = selectedProduct?.priceValue || 0;

  if (!storeConfig?.cashbackPercent || !priceValue) return null;

  const cashbackPriceValue = Math.round(
    priceValue * (storeConfig?.cashbackPercent || 1)
  );

  const cashbackPrice = formatPrice({
    amount: cashbackPriceValue,
    currencyCode: storeConfig?.currencyCode || "SAR",
    options: {
      maximumFractionDigits: 2,
    },
  });

  return (
    <CashbackDialog
      dialogContent={
        content ? <CashbackDialogBody content={content} /> : undefined
      }
      title={content?.title}
    >
      <ProductDetailBadge
        bgColor="#FFA5001A"
        icon={RiyalCoinImage}
        iconAlt="riyal coin"
      >
        <span className="text-text-primary text-[11px] font-medium leading-none">
          {t.rich("earnCashback", {
            price: () => <LocalizedPrice price={cashbackPrice} />,
          })}
        </span>
      </ProductDetailBadge>
    </CashbackDialog>
  );
};
