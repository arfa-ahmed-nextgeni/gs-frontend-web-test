/**
 * Transform ProductView from Catalog Service to ProductCardModel
 */

import { ProductViewOptionValueSwatch } from "@/catalog-service-graphql/graphql";
import {
  ProductBadgeType,
  ProductCardVariant,
  ProductOptionType,
  StockStatus,
} from "@/lib/constants/product/product-card";
import {
  ProductCardModel,
  ProductOption,
} from "@/lib/models/product-card-model";
import { ProductView } from "@/lib/types/catalog-service";
import { AssociatedProducts } from "@/lib/types/product/associated-products";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import {
  extractProductImage,
  extractProductPrice,
  getAttributeValue,
  getProductAttribute,
  isProductInStock,
  parseAttributeValue,
} from "@/lib/utils/catalog-service-transformers";
import { parseProductTagAttributes } from "@/lib/utils/product-tags";

import type { ProductTags } from "@/lib/types/product/product-tags";

/**
 * Transform array of ProductViews to ProductCardModels
 */
export function transformProductViewsToCardModels(
  productViews: ProductView[]
): ProductCardModel[] {
  return productViews.map((productView) =>
    transformProductViewToCardModel(productView)
  );
}

/**
 * Transform Catalog Service ProductView to ProductCardModel
 * This is used to display products in category pages and search results
 */
export function transformProductViewToCardModel(
  productView: ProductView
): ProductCardModel {
  // Handle undefined or null productView gracefully
  if (!productView) {
    return new ProductCardModel({
      brand: "",
      currency: "SAR",
      description: "",
      externalId: "",
      id: "",
      imageUrl: "",
      name: "Unknown Product",
      price: 0,
      sku: "",
      stockStatus: StockStatus.OutOfStock,
      urlKey: "",
    });
  }

  const { currency, discountPercent, finalPrice, regularPrice } =
    extractProductPrice(productView);

  const imageUrl = extractProductImage(productView);

  const inStock = isProductInStock(productView);

  const badges: {
    backgroundColor?: string;
    color?: string;
    type: string;
    value?: string;
  }[] = [];
  // if (discountPercent && discountPercent > 0) {
  //   badges.push({ type: "discount", value: `-${discountPercent}%` });
  // }

  // if (inStock && finalPrice < regularPrice) {
  //   badges.push({ type: "sale", value: "Sale" });
  // }

  const exclusiveAttr = getProductAttribute(productView, "exclusive");
  const isExclusive =
    Boolean(exclusiveAttr) && exclusiveAttr?.toLowerCase() === "yes";

  const isNewAttr = getProductAttribute(productView, "is_new");
  const isNew = Boolean(isNewAttr) && isNewAttr?.toLowerCase() === "yes";

  const productTags = parseAttributeValue<ProductTags>(
    productView?.attributes || [],
    "product_tags",
    []
  );
  const hasProductTags = Boolean(productTags && productTags.length > 0);

  if (isNew) {
    badges.push({ type: ProductBadgeType.NewArrival });
  }

  if (isExclusive && (!isNew || !hasProductTags)) {
    badges.push({ type: ProductBadgeType.Exclusive });
  }

  if (hasProductTags) {
    const customTag = productTags[0];

    badges.push({
      ...parseProductTagAttributes(customTag?.tag_attributes || ""),
      type: ProductBadgeType.Custom,
      value: customTag?.tag_title || "",
    });
  }

  const expressDeliveryAttr = getProductAttribute(
    productView,
    "express_delivery_available"
  );
  const bulletDelivery =
    typeof expressDeliveryAttr === "string" &&
    expressDeliveryAttr.trim().toLowerCase() === "yes";
  let options: ProductOption | undefined = undefined;
  let externalId = productView.externalId || "";

  if (productView.__typename === "ComplexProductView") {
    const associatedProducts = parseAttributeValue<AssociatedProducts>(
      productView?.attributes || [],
      "associated_products",
      {}
    );

    externalId = Object.values(associatedProducts)?.[0]?.externalId || "";

    options = {
      choices:
        productView.options?.[0]?.values?.map((option) => ({
          inStock: option.inStock || false,
          label: option.title || "",
          value:
            (option as ProductViewOptionValueSwatch).value || option.id || "",
        })) || [],
      type: productView.options?.[0]?.id as ProductOptionType,
    };
  }

  const ratingAttr = getProductAttribute(productView, "review_rating");
  let ratingSummary = 0;
  if (ratingAttr) {
    try {
      const ratingData = JSON.parse(ratingAttr);
      ratingSummary = ratingData.avg_rating ? ratingData.avg_rating * 20 : 0;
    } catch (error) {
      console.error("Error parsing review_rating data:", error);
      ratingSummary = 0;
    }
  }

  const brandNewAttr = getProductAttribute(productView, "brand_new");
  const brandAttr = getProductAttribute(productView, "brand");

  const productType =
    getProductAttribute(productView, "product_type_new2") ||
    getProductAttribute(productView, "product_type");

  const brand =
    brandNewAttr ||
    brandAttr ||
    productView.name?.trim().split(/\s+/)[0] ||
    "Brand";

  let countdownTimer: CountdownTimer | null = null;

  const countdownTimerEnabled =
    getAttributeValue<string>(
      productView?.attributes || [],
      "countdown_timer_enabled",
      ""
    ) === "yes";
  const countdownTimerStartDate = getAttributeValue<string>(
    productView?.attributes || [],
    "countdown_timer_start_date",
    ""
  );
  const countdownTimerEndDate = getAttributeValue<string>(
    productView?.attributes || [],
    "countdown_timer_end_date",
    ""
  );
  const countdownTimerTitle = getAttributeValue<string>(
    productView?.attributes || [],
    "countdown_timer_title",
    ""
  );

  if (
    countdownTimerEnabled &&
    countdownTimerStartDate &&
    countdownTimerEndDate
  ) {
    countdownTimer = {
      enabled: true,
      endDate: countdownTimerEndDate || "",
      startDate: countdownTimerStartDate || "",
      title: countdownTimerTitle || "",
    };
  }

  return new ProductCardModel({
    badges: badges.length > 0 ? badges : undefined,
    brand,
    bulletDelivery,
    countdownTimer,
    currency: currency,
    description: productView.shortDescription || "",
    discountPercent: discountPercent,
    externalId,
    id:
      productView.id ||
      productView.sku ||
      `product-${productView.sku || productView.name || "unknown"}`.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      ),
    imageUrl: imageUrl,
    name: productView.name || "",
    oldPrice: finalPrice < regularPrice ? regularPrice : undefined,
    options: options,
    price: finalPrice,
    productType: productType,
    ratingSummary: ratingSummary,
    savedAmount:
      finalPrice < regularPrice ? regularPrice - finalPrice : undefined,
    savedCurrency: currency,
    sku: productView.sku,
    stockStatus: inStock ? StockStatus.InStock : StockStatus.OutOfStock,
    urlKey: productView.urlKey || productView.sku?.toLowerCase(),
    variant: ProductCardVariant.Single,
  });
}
