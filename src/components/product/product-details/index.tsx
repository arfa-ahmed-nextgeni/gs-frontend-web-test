import { ProductActionButtons } from "@/components/product/product-action-buttons";
import { ProductDetailsBadges } from "@/components/product/product-details/product-details-badges";
import { ProductDetailsHeader } from "@/components/product/product-details/product-details-header";
import { ProductDetailsInfoGrid } from "@/components/product/product-details/product-details-info-grid";
import { ProductDetailsInstallments } from "@/components/product/product-details/product-details-installments";
import { ProductDetailsOriginalProduct } from "@/components/product/product-details/product-details-original-product";
import { ProductDetailsPrice } from "@/components/product/product-details/product-details-price";
import { ProductDetailsVariants } from "@/components/product/product-details/product-details-variants";
import { getPdpDialogConfigData } from "@/lib/actions/contentful/get-pdp-dialog-config-data";
import {
  Locale,
  TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES,
} from "@/lib/constants/i18n";
import { ProductType } from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";
import { cn } from "@/lib/utils";
import { getStoreCode } from "@/lib/utils/country";

export const ProductDetails = async ({
  locale,
  product,
}: {
  locale: Locale;
  product: ProductDetailsModel;
}) => {
  const pdpDialogConfig = await getPdpDialogConfigData({ locale });
  const storeCode = getStoreCode(locale);

  return (
    <div
      className={cn(
        "col-span-6 flex flex-col gap-5 px-2.5 lg:col-span-5 lg:px-0",
        {
          "justify-between":
            product.type &&
            ![ProductType.EGiftCard, ProductType.GiftCard].includes(
              product.type
            ) &&
            TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES.includes(storeCode),
        }
      )}
    >
      <div className="flex flex-col">
        <ProductDetailsHeader
          originalProductDialogContent={pdpDialogConfig?.originalProduct}
          product={product}
        />
        {product.type !== ProductType.EGiftCard && (
          <div className="flex flex-row justify-between">
            <ProductDetailsPrice containerProps={{ className: "lg:mt-9" }} />
            <ProductDetailsOriginalProduct
              containerProps={{ className: "lg:hidden flex" }}
              content={pdpDialogConfig?.originalProduct}
            />
          </div>
        )}
        {product.type &&
          ![ProductType.EGiftCard, ProductType.GiftCard].includes(
            product.type
          ) && (
            <ProductDetailsBadges
              cashbackDialogContent={pdpDialogConfig?.cashback}
            />
          )}

        {product.type &&
          ![ProductType.EGiftCard, ProductType.GiftCard].includes(
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
            (product.type && [ProductType.GiftCard].includes(product.type)) ||
            !TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES.includes(storeCode),
          "lg:mt-5":
            product.type && [ProductType.EGiftCard].includes(product.type),
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
