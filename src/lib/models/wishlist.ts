import {
  ConfigurableProduct,
  ConfigurableWishlistItem,
  CurrencyEnum,
  GetCustomerWishlistQuery,
} from "@/graphql/graphql";
import {
  ProductCardVariant,
  ProductOptionType,
} from "@/lib/constants/product/product-card";
import {
  ProductCardModel,
  ProductOption,
} from "@/lib/models/product-card-model";

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
  idInWishlist: string;
  isConfigurable = false;

  constructor({ __typename, id, product, ...item }: ConfigurableWishlistItem) {
    const minPrice = product?.price_range?.minimum_price;
    const finalPrice = minPrice?.final_price?.value || 0;
    const regularPrice = minPrice?.regular_price?.value;

    let options: ProductOption | undefined = undefined;
    let stockStatus = product?.stock_status || "";
    let bulletDelivery = false;
    let externalId = product?.id ? product?.id.toString() : "";

    if (__typename === "ConfigurableWishlistItem") {
      const configurableProduct = product as ConfigurableProduct;

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
      bulletDelivery =
        item.configured_variant?.express_delivery_available === 1;

      if (
        configurableProduct?.__typename === "ConfigurableProduct" &&
        item.configured_variant?.id
      ) {
        externalId = item.configured_variant.id.toString();
      }
    }

    super({
      bulletDelivery,
      currency: minPrice?.final_price.currency || CurrencyEnum.Sar,
      description: product?.short_description?.html || "",
      discountPercent: minPrice?.discount?.percent_off || undefined,
      externalId,
      id: product?.uid || "",
      imageUrl: product?.thumbnail?.url || "",
      name: product?.name || "",
      oldPrice: regularPrice || undefined,
      options,
      price: finalPrice,
      ratingSummary: product?.rating_summary,
      sku: product?.sku || "",
      stockStatus,
      urlKey: product?.url_key || "",
      variant: ProductCardVariant.Single,
    });

    this.idInWishlist = id;

    if (__typename === "ConfigurableWishlistItem") {
      this.isConfigurable = true;
      this.childSku = item.configured_variant?.sku || undefined;
    }
  }
}
