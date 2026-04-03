import { CurrencyEnum, GetProductBasicInfoQuery } from "@/graphql/graphql";
import { Helper } from "@/lib/models/helper";

export class ProductBasicInfo extends Helper {
  brand?: string;
  brandId?: number;
  description: string;
  id?: number;
  image: string;
  isConfigurable = false;
  name: string;
  oldPrice?: string;
  price: string;
  ratingSummary: number;
  reviewsCount: number;
  sku: string;
  type?: string;
  uid?: string;

  constructor(data: GetProductBasicInfoQuery) {
    super();

    const product = data.products?.items?.[0];

    this.sku = product?.sku || "";
    this.name = product?.name || "";
    this.id = product?.id || undefined;
    this.description = product?.short_description?.html || "";
    this.image = product?.thumbnail?.url || "";
    this.ratingSummary = this.convertRating(product?.rating_summary);
    this.reviewsCount = product?.review_count || 0;

    // Get uid if available (not all product types have it)
    if (product && "uid" in product) {
      this.uid = String(product.uid || "");
    }

    // Get brand ID from brand_new field (deprecated but still available)
    if (
      product &&
      "brand_new" in product &&
      typeof product.brand_new === "number"
    ) {
      this.brandId = product.brand_new;
    }

    // Convert __typename to product type string
    if (product?.__typename) {
      this.type =
        product.__typename === "ConfigurableProduct"
          ? "configurable"
          : product.__typename === "SimpleProduct"
            ? "simple"
            : product.__typename.toLowerCase();
    }

    const finalPrice =
      product?.price_range?.minimum_price?.final_price?.value || 0;
    const regularPrice =
      product?.price_range?.minimum_price?.regular_price?.value;
    const currencyCode =
      product?.price_range?.minimum_price?.final_price?.currency ||
      CurrencyEnum.Sar;

    this.price = this.formatPrice({
      amount: finalPrice,
      currencyCode,
    });

    if (regularPrice && regularPrice > finalPrice) {
      this.oldPrice = this.formatPrice({
        amount: regularPrice,
        currencyCode,
      });
    }

    if (product?.__typename === "ConfigurableProduct") {
      this.isConfigurable = true;
    }
  }
}
