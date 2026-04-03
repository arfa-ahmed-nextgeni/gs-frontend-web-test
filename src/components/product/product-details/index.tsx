import { ProductActionButtons } from "@/components/product/product-action-buttons";
import { ProductDetailsBadges } from "@/components/product/product-details/product-details-badges";
import { ProductDetailsHeader } from "@/components/product/product-details/product-details-header";
import { ProductDetailsInfoGrid } from "@/components/product/product-details/product-details-info-grid";
import { ProductDetailsInstallments } from "@/components/product/product-details/product-details-installments";
import { ProductDetailsOriginalProduct } from "@/components/product/product-details/product-details-original-product";
import { ProductDetailsPrice } from "@/components/product/product-details/product-details-price";
import { ProductDetailsVariants } from "@/components/product/product-details/product-details-variants";
import {
  Locale,
  TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES,
} from "@/lib/constants/i18n";
import { ProductType } from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";
import { cn } from "@/lib/utils";
import { getStoreCode } from "@/lib/utils/country";

export const ProductDetails = ({
  locale,
  product,
}: {
  locale: Locale;
  product: ProductDetailsModel;
}) => {
  const storeCode = getStoreCode(locale);

  return (
    <div
      className={cn(
        "col-span-6 flex flex-col gap-5 px-2.5 lg:col-span-5 lg:px-0",
        {
          "justify-between":
            ![ProductType.EGiftCard, ProductType.GiftCard].includes(
              product.type
            ) && TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES.includes(storeCode),
        }
      )}
    >
      <div className="flex flex-col">
        <ProductDetailsHeader />
        {product.type !== ProductType.EGiftCard && (
          <div className="flex flex-row justify-between">
            <ProductDetailsPrice containerProps={{ className: "lg:mt-9" }} />
            <ProductDetailsOriginalProduct
              containerProps={{ className: "lg:hidden flex" }}
            />
          </div>
        )}
        {![ProductType.EGiftCard, ProductType.GiftCard].includes(
          product.type
        ) && <ProductDetailsBadges />}

        {![ProductType.EGiftCard, ProductType.GiftCard].includes(
          product.type
        ) && (
          <div className="mt-5 flex flex-col gap-2.5 lg:mt-10">
            <ProductDetailsVariants />
            <ProductDetailsInfoGrid product={product} />
          </div>
        )}
      </div>

      <div
        className={cn("flex flex-col gap-2.5", {
          "lg:mt-15":
            [ProductType.GiftCard].includes(product.type) ||
            !TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES.includes(storeCode),
          "lg:mt-5": [ProductType.EGiftCard].includes(product.type),
        })}
      >
        <ProductActionButtons />
        {product.type !== ProductType.EGiftCard && (
          <ProductDetailsInstallments />
        )}
      </div>
    </div>
  );
};
