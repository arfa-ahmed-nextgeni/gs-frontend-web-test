import {
  CurrencyEnum,
  GetProductDetailsByUrlKeyQuery,
  Maybe,
  ProductViewCurrency,
} from "@/catalog-service-graphql/graphql";
import { ProductOptionType } from "@/lib/constants/product/product-card";
import { ProductType } from "@/lib/constants/product/product-details";
import { Helper } from "@/lib/models/helper";
import {
  AssociatedProducts,
  GalleryItem,
} from "@/lib/types/product/associated-products";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import { ProductAttribute } from "@/lib/types/product/product-attribute";
import { ProductTagLabel, ProductTags } from "@/lib/types/product/product-tags";
import { resolveProductImageUrl } from "@/lib/utils/image";
import { isPerfumeAttributeSet } from "@/lib/utils/product-type";

export type ProductMedia = {
  preview?: string;
  type: "image" | "video";
  url: string;
};

type ProductInfo = {
  area?: string;
  coverage?: string;
  gender?: string;
  intensity?: string;
  skinType?: string;
  type?: string;
  year?: string;
};

type ReviewRating = {
  avg_percent?: number;
  avg_rating?: number;
  total_review_count?: number;
};

export class ProductDetailsModel extends Helper {
  attributeSet?: string;
  availableStock?: number;
  averageRating?: number;
  brand: string;
  bulletDelivery = false;
  countdownTimer: CountdownTimer | null = null;
  defaultSelectedVariantIndex = 0;
  description: string;
  externalId: string;
  id: number;
  ingredients?: string;
  inStock = false;
  isConfigurable = false;
  isExclusive = false;
  isNew = false;
  lowStockMessage?: string;
  mediaGallery: ProductMedia[] = [];
  metaDescription?: string;
  metaKeywords?: string;
  metaTitle?: string;
  name: string;
  oldPrice?: string;
  parentProductUrl?: string;
  price?: string;
  priceValue?: number;
  productInfo: ProductInfo = {};
  productInfoList: { label: string; value: string }[] = [];
  productTags?: ProductTagLabel[];
  ratingCount?: number;
  savedPrice?: null | string;
  selectedVariantInfo?: {
    index: number;
    label: string;
  };
  sku: string;
  type: ProductType;
  urlKey: string;
  variants: ProductVariant[] = [];

  constructor(data: GetProductDetailsByUrlKeyQuery) {
    super();

    const product = data.productSearch?.items?.[0];
    const productData = product?.productView;

    const product_type = this.getAttributeValue<string>(
      productData?.attributes || [],
      "product_type",
      ""
    );
    const attributeSet = this.getAttributeValue<string>(
      productData?.attributes || [],
      "attribute_set",
      ""
    );

    this.attributeSet = attributeSet;

    this.type =
      product_type === "giftcard"
        ? ProductType.GiftCard
        : product_type === "virtual"
          ? ProductType.EGiftCard
          : isPerfumeAttributeSet(attributeSet)
            ? ProductType.Perfume
            : ProductType.Beauty;

    this.id = productData?.externalId ? +productData?.externalId : 0;
    this.externalId = productData?.externalId || "";
    this.sku = productData?.sku || "";
    this.urlKey = productData?.urlKey || "";
    this.name = productData?.name || "";
    this.description = productData?.description || "";
    this.metaTitle = productData?.metaTitle || undefined;
    this.metaDescription = productData?.metaDescription || undefined;
    this.metaKeywords = productData?.metaKeyword || undefined;
    this.parentProductUrl =
      this.getAttributeValue<string>(
        productData?.attributes || [],
        "parent_product_url",
        ""
      ) || undefined;
    this.mediaGallery =
      productData?.images
        ?.map((image) => ({
          type: "image" as const,
          url: resolveProductImageUrl(image?.url),
        }))
        ?.filter((media) => !!media.url) || [];

    const videos: ProductMedia[] =
      productData?.videos
        ?.filter((video) => !!video?.url)
        .map((video) => ({
          preview: video?.preview?.url,
          type: "video",
          url: video?.url || "",
        })) || [];

    this.mediaGallery = this.removeDuplicateUrls(
      this.mediaGallery.concat(videos)
    );

    this.ingredients = this.getAttributeValue<string>(
      productData?.attributes || [],
      "ingredients",
      ""
    );
    this.isExclusive =
      this.getAttributeValue<string>(
        productData?.attributes || [],
        "exclusive",
        ""
      ).toLowerCase() === "yes";
    this.isNew =
      this.getAttributeValue<string>(
        productData?.attributes || [],
        "is_new",
        ""
      ).toLowerCase() === "yes";

    const attrs = productData?.attributes || [];
    const emptyAttr: ProductAttribute = { label: "", value: "" };

    const PRODUCT_INFO_KEYS = [
      "brand_new",
      "color",
      "gender",
      "product_type_new2",
      "makeup_color",
      "area_of_apply",
      "texture",
      "character",
      "fragrance_notes",
      // variant slot inserted before this index
      "size_new",
      "year_of_launch",
      "concentration",
      "product_color",
      "item_category",
      "skin_type",
      "finish",
      "coverage",
      "categories",
      "top_notes",
      "middle_notes",
      "base_notes",
    ] as const;
    const VARIANT_SLOT_KEY = "size_new";
    const ARRAY_VALUE_KEYS = new Set<string>(["categories"]);

    const resolved = PRODUCT_INFO_KEYS.map((key) => {
      if (ARRAY_VALUE_KEYS.has(key)) {
        const a = this.parseAttribute<{
          label: string;
          value: string | string[];
        }>(attrs, key, { label: "", value: [""] });
        const value = Array.isArray(a.value) ? a.value.join(", ") : a.value;
        return { key, label: a.label, value };
      }
      const a = this.getAttribute<{ label: string; value: string | string[] }>(
        attrs,
        key,
        emptyAttr
      );
      const value = Array.isArray(a.value) ? a.value.join(", ") : a.value;
      return { key, label: a.label, value };
    });
    const byKey = Object.fromEntries(resolved.map((r) => [r.key, r])) as Record<
      (typeof PRODUCT_INFO_KEYS)[number],
      { key: string; label: string; value: string }
    >;

    this.brand = byKey.brand_new.value;

    this.productInfo = {
      area: byKey.area_of_apply.value,
      coverage: byKey.coverage.value,
      gender: byKey.gender.value,
      intensity: byKey.concentration.value,
      skinType: byKey.skin_type.value,
      type: byKey.product_type_new2.value,
      year: byKey.year_of_launch.value,
    };

    const variantSlotPos = PRODUCT_INFO_KEYS.indexOf(VARIANT_SLOT_KEY);
    let variantInfoIndex = 0;
    resolved.forEach((r, i) => {
      if (!(r.label && r.value)) return;
      this.productInfoList.push({ label: r.label, value: r.value });
      if (i < variantSlotPos) variantInfoIndex++;
    });

    const reviewRating = this.parseAttributeValue<ReviewRating>(
      productData?.attributes || [],
      "review_rating",
      {}
    );

    this.ratingCount = reviewRating.total_review_count;
    this.averageRating = reviewRating.avg_rating;

    const productTags = this.parseAttributeValue<ProductTags>(
      productData?.attributes || [],
      "product_tags",
      []
    );

    this.productTags = productTags.map((tag) => ({
      ...this.parseProductTagAttributes(tag.tag_attributes),
      title: tag.tag_title,
    }));

    if (productData?.__typename === "SimpleProductView") {
      const finalPrice = productData.price?.final?.amount?.value || 0;
      const regularPrice = productData.price?.regular?.amount?.value;
      const currency =
        productData.price?.final?.amount?.currency !== ProductViewCurrency.None
          ? productData.price?.final?.amount?.currency ||
            ProductViewCurrency.Sar
          : ProductViewCurrency.Sar;
      const rawValueOff = this.parseAttributeValue<
        { amount_off: null | number } | { amount_off: null | number }[]
      >(productData?.attributes || [], "value_off", { amount_off: null });
      const amountOff = (
        Array.isArray(rawValueOff) ? rawValueOff[0] : rawValueOff
      )?.amount_off;
      const bulletDelivery =
        this.getAttributeValue<string>(
          productData?.attributes || [],
          "express_delivery_available",
          ""
        ) === "yes";
      const countdownTimerEnabled =
        this.getAttributeValue<string>(
          productData?.attributes || [],
          "countdown_timer_enabled",
          ""
        ) === "yes";
      const countdownTimerStartDate = this.getAttributeValue<string>(
        productData?.attributes || [],
        "countdown_timer_start_date",
        ""
      );
      const countdownTimerEndDate = this.getAttributeValue<string>(
        productData?.attributes || [],
        "countdown_timer_end_date",
        ""
      );
      const countdownTimerTitle = this.getAttributeValue<string>(
        productData?.attributes || [],
        "countdown_timer_title",
        ""
      );

      if (bulletDelivery) {
        this.bulletDelivery = true;
      }

      if (
        countdownTimerEnabled &&
        countdownTimerStartDate &&
        countdownTimerEndDate
      ) {
        this.countdownTimer = {
          enabled: true,
          endDate: countdownTimerEndDate,
          startDate: countdownTimerStartDate,
          title: countdownTimerTitle || "",
        };
      }

      this.inStock = productData.inStock || false;
      this.availableStock = this.toInteger(
        this.getAttributeValue<number | string | undefined>(
          productData?.attributes || [],
          "available_stock",
          undefined
        )
      );
      this.price = this.formatPrice({
        amount: finalPrice,
        currencyCode: currency,
      });
      this.priceValue = finalPrice;
      this.oldPrice =
        regularPrice && regularPrice > finalPrice
          ? this.formatPrice({
              amount: regularPrice,
              currencyCode: currency,
            })
          : undefined;
      this.savedPrice =
        amountOff && typeof amountOff === "number"
          ? this.formatPrice({
              amount: amountOff,
              currencyCode: currency,
            })
          : null;
      this.lowStockMessage = this.parseAttributeValue<string>(
        productData?.attributes || [],
        "low_stock_qty",
        ""
      );
    }

    if (
      productData?.__typename === "ComplexProductView" &&
      productData.options?.[0]?.values
    ) {
      this.isConfigurable = true;

      this.priceValue =
        product?.product?.price_range?.minimum_price?.final_price?.value ||
        undefined;

      const isSwatchOptions =
        productData.options[0].values?.[0]?.__typename ===
        "ProductViewOptionValueSwatch";
      let optionValues = productData.options[0].values;

      if (isSwatchOptions) {
        this.type = ProductType.Beauty;
        optionValues = productData.options[0].values.sort(
          (a, b) => Number(b.inStock) - Number(a.inStock)
        );
      }

      if (productData.options[0].title) {
        this.selectedVariantInfo = {
          index: variantInfoIndex,
          label: productData.options[0].title,
        };
      }

      const associatedProducts = this.parseAttributeValue<AssociatedProducts>(
        productData?.attributes || [],
        "associated_products",
        {}
      );

      // this.defaultSelectedVariantIndex = getDefaultVariantIndex(
      //   associatedProducts,
      //   optionValues
      // );

      const variantOptions = optionValues.map((value) => {
        const associatedProduct = associatedProducts?.[value?.id || ""];

        return {
          ...value,
          ...associatedProduct,
        };
      });

      this.variants =
        variantOptions?.map(
          (option) =>
            new ProductVariant({
              amountOff: option.value_off?.amount_off,
              availableStock: option.available_stock,
              color:
                option.__typename === "ProductViewOptionValueSwatch" &&
                option?.value
                  ? option.value
                  : undefined,
              countdownTimerEnabled:
                option.countdown_timer?.countdown_timer_enabled,
              countdownTimerEndDate:
                option.countdown_timer?.countdown_timer_end_date,
              countdownTimerStartDate:
                option.countdown_timer?.countdown_timer_start_date,
              countdownTimerTitle:
                option.countdown_timer?.countdown_timer_title,
              currency:
                product?.product?.price_range?.minimum_price?.final_price
                  ?.currency !== CurrencyEnum.None
                  ? product?.product?.price_range?.minimum_price?.final_price
                      ?.currency || CurrencyEnum.Sar
                  : CurrencyEnum.Sar,
              exclusive: option.exclusive,
              expressDeliveryAvailable: option.express_delivery_available,
              externalId: option.externalId || "",
              finalPrice: option.final_price || 0,
              gallery: option.gallery,
              id: option.id || "",
              image: option.image,
              inStock: option.inStock || false,
              isNew: option.is_new,
              label: option.title || "",
              lowStockQty: option.low_stock_qty,
              productTags: option.product_tags,
              regularPrice: option.regular_price || undefined,
              sku: option.sku,
              type: productData.options?.[0]?.id as ProductOptionType,
              urlKey: productData.urlKey,
            })
        ) || [];
    }
  }
}

export class ProductVariant extends Helper {
  availableStock?: number;
  bulletDelivery = false;
  color?: string;
  countdownTimer: CountdownTimer | null = null;
  externalId: string;
  id: string;
  inStock: boolean;
  isExclusive = false;
  isNew = false;
  label: string;
  lowStockMessage?: string;
  mediaGallery: ProductMedia[] = [];
  oldPrice?: string;
  price: string;
  priceValue: number;
  productTags?: ProductTagLabel[];
  savedPrice?: null | string;
  sku: string;
  type: ProductOptionType;
  urlKey: string;

  constructor({
    amountOff,
    availableStock,
    color,
    countdownTimerEnabled,
    countdownTimerEndDate,
    countdownTimerStartDate,
    countdownTimerTitle,
    currency,
    exclusive,
    expressDeliveryAvailable,
    externalId,
    finalPrice,
    gallery,
    id,
    image,
    inStock,
    isNew,
    label,
    lowStockQty,
    productTags,
    regularPrice,
    sku,
    type,
    urlKey,
  }: {
    amountOff?: null | number;
    availableStock?: null | number;
    color?: string;
    countdownTimerEnabled?: boolean;
    countdownTimerEndDate?: null | string;
    countdownTimerStartDate?: null | string;
    countdownTimerTitle?: null | string;
    currency: CurrencyEnum;
    exclusive?: string;
    expressDeliveryAvailable?: boolean | null | string;
    externalId: string;
    finalPrice: number;
    gallery?: GalleryItem[];
    id: string;
    image?: string;
    inStock: boolean;
    isNew?: string;
    label: string;
    lowStockQty?: null | string;
    productTags?: ProductTags;
    regularPrice?: number;
    sku?: Maybe<string>;
    type: ProductOptionType;
    urlKey?: Maybe<string>;
  }) {
    super();

    this.sku = sku || "";
    this.externalId = externalId;
    this.urlKey = urlKey || "";
    this.type = type;
    this.id = id;
    this.inStock = inStock;
    this.availableStock = this.toInteger(availableStock ?? undefined);
    this.label = label;
    this.color = color;

    const mediaGallery =
      gallery
        ?.map((item) => {
          const isVideo = item.mediaType === "external-video";
          const rawUrl = (isVideo ? item.video_url : item.file) || "";
          return {
            type: (isVideo ? "video" : "image") as ProductMedia["type"],
            url: isVideo ? rawUrl : resolveProductImageUrl(rawUrl),
          };
        })
        ?.filter((mediaItem) => !!mediaItem.url) || [];
    const imageUrl = resolveProductImageUrl(this.getValidUrl(image));

    this.mediaGallery = this.removeDuplicateUrls(
      imageUrl && mediaGallery?.length > 0
        ? [{ type: "image", url: imageUrl }, ...mediaGallery]
        : mediaGallery
    );

    this.price = this.formatPrice({
      amount: finalPrice,
      currencyCode: currency,
    });
    this.priceValue = finalPrice;
    this.oldPrice =
      regularPrice && regularPrice > finalPrice
        ? this.formatPrice({
            amount: regularPrice,
            currencyCode: currency,
          })
        : undefined;

    this.savedPrice =
      amountOff && typeof amountOff === "number"
        ? this.formatPrice({
            amount: amountOff,
            currencyCode: currency,
          })
        : null;

    this.isExclusive = exclusive?.toLowerCase() === "yes";
    this.isNew = isNew?.toLowerCase() === "yes";
    this.lowStockMessage = lowStockQty || "";

    this.productTags =
      productTags?.map((tag) => ({
        ...this.parseProductTagAttributes(tag.tag_attributes),
        title: tag.tag_title,
      })) || undefined;

    const bulletDelivery =
      typeof expressDeliveryAvailable === "string"
        ? expressDeliveryAvailable?.toLowerCase() === "yes"
        : expressDeliveryAvailable === true
          ? true
          : false;

    if (bulletDelivery) {
      this.bulletDelivery = true;
    }

    if (
      countdownTimerEnabled &&
      countdownTimerStartDate &&
      countdownTimerEndDate
    ) {
      this.countdownTimer = {
        enabled: true,
        endDate: countdownTimerEndDate,
        startDate: countdownTimerStartDate,
        title: countdownTimerTitle || "",
      };
    }
  }
}

// function getDefaultVariantIndex(
//   associatedProducts: AssociatedProducts | null,
//   optionValues: any[]
// ) {
//   if (optionValues.length === 0) return 0;

//   if (!associatedProducts || Object.keys(associatedProducts).length === 0) {
//     return 0;
//   }

//   const firstVariantId = Object.keys(associatedProducts)[0];
//   if (!firstVariantId) return 0;

//   const matchedIndex = optionValues.findIndex(
//     (opt) => opt.id === firstVariantId
//   );
//   return matchedIndex !== -1 ? matchedIndex : 0;
// }
