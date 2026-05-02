import {
  ProductCardVariant,
  ProductOptionType,
} from "@/lib/constants/product/product-card";
import { Helper } from "@/lib/models/helper";
import {
  ProductCardModel,
  type ProductOption,
} from "@/lib/models/product-card-model";

import type {
  ConfigurableProduct,
  ConfigurableWishlistItem,
  CurrencyEnum,
  GetCustomerWishlistQuery,
} from "@/graphql/graphql";

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
        .filter((item) => item?.product !== undefined)
        .map(
          (item) =>
            new WishlistItem(item as unknown as ConfigurableWishlistItem)
        ) || [];
  }
}

export class WishlistItem extends ProductCardModel {
  childSku?: string;
  color?: string;
  idInWishlist: string;
  isConfigurable = false;
  size?: string;

  constructor({ __typename, id, product, ...item }: ConfigurableWishlistItem) {
    const minPrice = product?.price_range?.minimum_price;
    const finalPrice = minPrice?.final_price?.value || 0;
    const regularPrice = minPrice?.regular_price?.value;

    let options: ProductOption | undefined = undefined;
    let stockStatus = product?.stock_status || "";
    let bulletDelivery = false;
    let externalId = product?.id ? product?.id.toString() : "";
    let sku = product?.sku || "";
    let parentId: string | undefined = undefined;
    let skuParent: string | undefined = undefined;
    let color: string | undefined = undefined;
    let size: string | undefined = undefined;

    if (__typename === "ConfigurableWishlistItem") {
      const configurableProduct = product as ConfigurableProduct;

      const sizeOpt = item.configurable_options?.find((opt) =>
        opt?.option_label?.toLowerCase().includes("size")
      );
      size = sizeOpt?.value_label || undefined;

      const colorOpt = item.configurable_options?.find((opt) =>
        opt?.option_label?.toLowerCase().includes("color")
      );
      color = colorOpt?.value_label || undefined;

      options = {
        choices:
          item.configurable_options?.map((option) => ({
            inStock: true,
            label: option?.value_label || "",
            value: option?.configurable_product_option_value_uid || "",
          })) || [],
        type: ProductOptionType.Size,
      };

      stockStatus = item.configured_variant?.stock_status || "";
      bulletDelivery = Helper.isFlagEnabled(
        item.configured_variant?.express_delivery_available
      );

      if (
        configurableProduct?.__typename === "ConfigurableProduct" &&
        item.configured_variant?.id
      ) {
        parentId = externalId;
        skuParent = sku;
        externalId = item.configured_variant.id.toString();
        sku = item.configured_variant.sku || sku;
      }
    }

    const productType = product?.product_type_new2 || undefined;

    super({
      brand: product?.brand_new_label || "",
      bulletDelivery,
      currency: minPrice?.final_price.currency || ("SAR" as CurrencyEnum),
      description: product?.short_description?.html || "",
      discountPercent: minPrice?.discount?.percent_off || undefined,
      externalId,
      id: product?.uid || "",
      imageUrl: product?.thumbnail?.url || "",
      name: product?.name || "",
      oldPrice: regularPrice || undefined,
      options,
      parentId,
      price: finalPrice,
      productType,
      ratingSummary: product?.rating_summary,
      savedAmount: 0,
      sku,
      skuParent,
      stockStatus,
      urlKey: product?.url_key || "",
      variant: ProductCardVariant.Single,
    });

    this.idInWishlist = id;
    this.color = color;
    this.size = size;

    if (__typename === "ConfigurableWishlistItem") {
      this.isConfigurable = true;
      this.childSku = item.configured_variant?.sku || undefined;
    }
  }
}
