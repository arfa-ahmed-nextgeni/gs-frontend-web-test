import {
  ConfigurableWishlistItem,
  CurrencyEnum,
  GetCustomerWishlistQuery,
  SimpleWishlistItem,
} from "@/graphql/graphql";
import {
  ProductCardVariant,
  ProductOptionType,
} from "@/lib/constants/product/product-card";
import { Helper } from "@/lib/models/helper";
import {
  ProductCardModel,
  type ProductOption,
} from "@/lib/models/product-card-model";
import { resolveProductImageUrl } from "@/lib/utils/image";
import { isBundlesProductType } from "@/lib/utils/product-type";

type WishlistItemType = ConfigurableWishlistItem | SimpleWishlistItem;

export class Wishlist {
  id: string;
  items: WishlistItem[];
  totalPages: number;

  constructor(data?: GetCustomerWishlistQuery) {
    this.id = data?.customer?.wishlists[0]?.id || "";
    this.totalPages =
      data?.customer?.wishlists[0]?.items_v2?.page_info?.total_pages || 1;
    this.items =
      data?.customer?.wishlists[0]?.items_v2?.items
        ?.filter((item): item is NonNullable<typeof item> => !!item)
        .map((item) => new WishlistItem(item as unknown as WishlistItemType)) ||
      [];
  }
}

export class WishlistItem extends ProductCardModel {
  childSku?: string;
  color?: string;
  idInWishlist: string;
  isConfigurable = false;
  size?: string;

  constructor({ __typename, id, product, ...item }: WishlistItemType) {
    let minPrice = product?.price_range?.minimum_price;
    let options: ProductOption | undefined = undefined;
    let bulletDelivery = false;
    let externalId = product?.id ? product?.id.toString() : "";
    let sku = product?.sku || "";
    let parentId: string | undefined = undefined;
    let skuParent: string | undefined = undefined;
    let color: string | undefined = undefined;
    let size: string | undefined = undefined;
    let variantStockStatus: string | undefined = undefined;
    let variantImageUrl: string | undefined = undefined;

    if (__typename === "ConfigurableWishlistItem") {
      const confItem = item as ConfigurableWishlistItem;

      if (confItem.configured_variant) {
        parentId = externalId;
        skuParent = sku;
        externalId = `${confItem.configured_variant.id ?? ""}`;
        sku = confItem.configured_variant.sku || sku;
        variantStockStatus =
          (confItem.configured_variant as any).stock_status ?? undefined;
        variantImageUrl =
          confItem.configured_variant?.thumbnail?.url || undefined;
      }

      const sizeOpt = confItem.configurable_options?.find((opt) =>
        opt?.option_label?.toLowerCase().includes("size")
      );
      size = sizeOpt?.value_label || undefined;

      const colorOpt = confItem.configurable_options?.find((opt) =>
        opt?.option_label?.toLowerCase().includes("color")
      );
      color = colorOpt?.value_label || undefined;

      options = {
        choices:
          confItem.configurable_options?.map((option) => ({
            inStock: true,
            label: option?.value_label || "",
            value: option?.configurable_product_option_value_uid || "",
          })) || [],
        type: ProductOptionType.Size,
      };
      minPrice = confItem?.configured_variant?.price_range.minimum_price;

      bulletDelivery = Helper.isFlagEnabled(
        confItem.configured_variant?.express_delivery_available
      );
    } else {
      const simpleItem = item as SimpleWishlistItem;

      bulletDelivery = Helper.isFlagEnabled(
        simpleItem.product?.express_delivery_available
      );
    }

    const finalPrice = minPrice?.final_price?.value || 0;
    const regularPrice = minPrice?.regular_price?.value;
    const currency = minPrice?.final_price.currency || ("SAR" as CurrencyEnum);
    const discountPercent = minPrice?.discount?.percent_off || undefined;
    const savedAmount = minPrice?.discount?.amount_off || 0;
    const productType = product?.product_type_new2_label || undefined;

    super({
      brand: product?.brand_new_label || "",
      bulletDelivery,
      currency,
      description: product?.short_description?.html || "",
      discountPercent,
      externalId,
      id: product?.uid || "",
      imageUrl: resolveProductImageUrl(
        variantImageUrl,
        product?.thumbnail?.url
      ),
      name: product?.name || "",
      oldPrice: regularPrice || undefined,
      options,
      parentId,
      price: finalPrice,
      productType,
      ratingSummary: product?.rating_summary,
      savedAmount,
      savedCurrency: currency,
      sku,
      skuParent,
      stockStatus: variantStockStatus || product?.stock_status || "",
      urlKey: product?.url_key || "",
      variant: isBundlesProductType(productType)
        ? ProductCardVariant.Bundles
        : ProductCardVariant.Single,
    });

    this.idInWishlist = id;
    this.color = color;
    this.size = size;

    if (__typename === "ConfigurableWishlistItem") {
      const confItem = item as ConfigurableWishlistItem;

      this.isConfigurable = true;
      this.childSku = confItem?.configured_variant?.sku || undefined;
    }
  }
}
