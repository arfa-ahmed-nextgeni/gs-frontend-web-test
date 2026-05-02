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
    this.mediaGallery =
      productData?.images
        ?.filter((image) => !!image?.url)
        ?.map((image) => ({
          type: "image",
          url: image?.url || "",
        })) || [];

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

    const brand = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "brand_new",
      { label: "", value: "" }
    );

    this.brand = brand.value;

    const productType = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "product_type_new2",
      { label: "", value: "" }
    );
    const gender = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "gender",
      { label: "", value: "" }
    );
    const year = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "year_of_launch",
      { label: "", value: "" }
    );
    const areaOfApply = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "area_of_apply",
      { label: "", value: "" }
    );
    const skinType = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "skin_type",
      { label: "", value: "" }
    );
    const coverage = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "coverage",
      { label: "", value: "" }
    );
    const concentration = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "concentration",
      { label: "", value: "" }
    );
    const character = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "character",
      { label: "", value: "" }
    );
    const productColor = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "product_color",
      { label: "", value: "" }
    );
    const finish = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "finish",
      { label: "", value: "" }
    );
    const itemCategory = this.getAttribute<ProductAttribute>(
      productData?.attributes || [],
      "item_category",
      { label: "", value: "" }
    );
    const categories = this.parseAttribute<{
      label: string;
      value: string | string[];
    }>(productData?.attributes || [], "categories", { label: "", value: [""] });

    this.productInfo = {
      area: areaOfApply.value,
      coverage: coverage.value,
      gender: gender.value,
      intensity: concentration.value,
      skinType: skinType.value,
      type: productType.value,
      year: year.value,
    };

    if (brand.label && brand.value) this.productInfoList.push(brand);
    if (character.label && character.value)
      this.productInfoList.push(character);
    if (concentration.label && concentration.value)
      this.productInfoList.push(concentration);
    if (gender.label && gender.value) this.productInfoList.push(gender);
    if (productColor.label && productColor.value)
      this.productInfoList.push(productColor);
    const variantInfoIndex = this.productInfoList.length;
    if (productType.label && productType.value)
      this.productInfoList.push(productType);
    if (itemCategory.label && itemCategory.value)
      this.productInfoList.push(itemCategory);
    if (areaOfApply.label && areaOfApply.value)
      this.productInfoList.push(areaOfApply);
    if (skinType.label && skinType.value) this.productInfoList.push(skinType);
    if (finish.label && finish.value) this.productInfoList.push(finish);
    if (coverage.label && coverage.value) this.productInfoList.push(coverage);
    if (categories.label && categories.value)
      this.productInfoList.push({
        label: categories.label,
        value: Array.isArray(categories.value)
          ? categories.value.join(", ")
          : categories.value,
      });
    if (year.label && year.value) this.productInfoList.push(year);

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
      const amountOff = this.parseAttributeValue<{ amount_off: null | number }>(
        productData?.attributes || [],
        "value_off",
        { amount_off: null }
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
    this.label = label;
    this.color = color;

    const mediaGallery =
      gallery
        ?.map((item) => ({
          type:
            item.mediaType === "external-video"
              ? "video"
              : ("image" as ProductMedia["type"]),
          url:
            (item.mediaType === "external-video"
              ? item.video_url
              : item.file) || "",
        }))
        ?.filter((mediaItem) => !!mediaItem.url) || [];
    const imageUrl = this.getValidUrl(image);

    this.mediaGallery = this.removeDuplicateUrls(
      imageUrl
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
