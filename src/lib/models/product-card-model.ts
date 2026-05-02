import { ProductStockStatus } from "@/graphql/graphql";
import {
  ProductBadgeType,
  ProductCardVariant,
  ProductOptionType,
  StockStatus,
} from "@/lib/constants/product/product-card";
import { Helper } from "@/lib/models/helper";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";

export interface OptionChoice {
  inStock: boolean;
  label: string;
  value: string;
}

export interface ProductBadge {
  backgroundColor?: string;
  color?: string;
  type: ProductBadgeType;
  value?: string;
}

export interface ProductOption {
  choices: OptionChoice[];
  selected?: OptionChoice;
  type: ProductOptionType;
}

export class ProductCardModel extends Helper {
  attributeSet?: string;
  badges?: ProductBadge[];
  brand: string;
  bulletDelivery?: boolean;
  countdownTimer?: CountdownTimer | null = null;
  currency: string;
  currentPrice: string;
  description: string;
  discountPercent?: number;
  externalId: string;
  id: string;
  imageUrl: string;
  isGwp?: boolean;
  isWrap?: boolean;
  name: string;
  oldPrice?: string;
  options?: ProductOption;
  parentId?: string;
  priceValue: number;
  productType?: string;
  rating?: number;
  savedAmount?: number;
  savedCurrency?: string;
  savedPrice?: string;
  sku?: string;
  skuParent?: string;
  stockStatus: StockStatus;
  urlKey: string;
  variant: ProductCardVariant;

  get isOutOfStock() {
    return this.stockStatus === StockStatus.OutOfStock;
  }

  constructor({
    attributeSet,
    badges,
    brand,
    bulletDelivery,
    countdownTimer,
    currency,
    description,
    discountPercent,
    externalId,
    id,
    imageUrl,
    isGwp,
    isWrap,
    locale = "en-US",
    name,
    oldPrice,
    options,
    parentId,
    price,
    productType,
    rating,
    ratingSummary,
    savedAmount,
    savedCurrency,
    sku,
    skuParent,
    stockStatus,
    urlKey,
    variant,
  }: {
    attributeSet?: string;
    badges?: {
      backgroundColor?: string;
      color?: string;
      type: string;
      value?: string;
    }[];
    brand: string;
    bulletDelivery?: boolean;
    countdownTimer?: CountdownTimer | null;
    currency: string;
    description: string;
    discountPercent?: number;
    externalId: string;
    id: string;
    imageUrl: string;
    isGwp?: boolean;
    isWrap?: boolean;
    locale?: string;
    name: string;
    oldPrice?: number;
    options?: {
      choices: { inStock: boolean; label: string; value: string }[];
      type: string;
    };
    parentId?: string;
    price: number;
    productType?: string;
    rating?: number;
    ratingSummary?: number;
    savedAmount?: number;
    savedCurrency?: string;
    sku?: string;
    skuParent?: string;
    stockStatus: ProductStockStatus | string;
    urlKey?: string;
    variant?: ProductCardVariant;
  }) {
    super();
    this.attributeSet = attributeSet;
    this.sku = sku;
    this.skuParent = skuParent;
    this.parentId = parentId;
    this.externalId = externalId;
    this.urlKey = urlKey || "";
    this.productType = productType;
    this.bulletDelivery =
      bulletDelivery ??
      badges?.some((badge) => badge.type === ProductBadgeType.HourDelivery);
    this.countdownTimer = countdownTimer;
    this.badges = badges
      ?.filter((badge) => badge.type !== ProductBadgeType.HourDelivery)
      ?.map(({ backgroundColor, color, type, value }) => ({
        backgroundColor,
        color,
        type: type as ProductBadgeType,
        value,
      }));
    this.id = id;
    this.imageUrl = imageUrl;
    this.name = name;
    this.brand = brand;
    this.options = options
      ? {
          choices: options.choices,
          type: options.type as ProductOptionType,
        }
      : undefined;
    this.stockStatus = stockStatus as StockStatus;
    this.variant = variant ?? ProductCardVariant.Single;
    this.description = description;
    this.rating =
      rating ||
      (ratingSummary ? Math.round((ratingSummary / 20) * 10) / 10 : undefined);
    this.savedAmount = savedAmount;
    this.savedCurrency = savedCurrency;
    this.currency = currency;
    this.discountPercent = this.toInteger(discountPercent);
    this.priceValue = price;
    this.currentPrice = this.formatPrice({
      amount: price,
      currencyCode: currency,
      locale: locale,
    });

    let calculatedOldPrice: number | undefined;
    if (this.discountPercent && this.discountPercent > 0 && !oldPrice) {
      calculatedOldPrice = price / (1 - this.discountPercent / 100);

      if (calculatedOldPrice <= price) {
        calculatedOldPrice = undefined;
      }
    }

    this.oldPrice =
      (oldPrice && oldPrice !== price) || calculatedOldPrice
        ? this.formatPrice({
            amount: oldPrice || calculatedOldPrice!,
            currencyCode: currency,
            locale: locale,
          })
        : undefined;
    this.name = this.name;
    this.savedPrice =
      this.variant === ProductCardVariant.Bundles &&
      this.savedAmount &&
      this.savedCurrency
        ? this.formatPrice({
            amount: this.savedAmount,
            currencyCode: this.savedCurrency,
            locale: locale,
          })
        : undefined;
    this.isGwp = isGwp;
    this.isWrap = isWrap;
  }
}
