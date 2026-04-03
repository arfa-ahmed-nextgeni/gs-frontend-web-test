export const enum CartAction {
  Add = "add",
  Added = "added",
  MoveToBag = "move_to_bag",
  NotifyMe = "notify_me",
  Options = "options",
  Remove = "remove",
}

export const enum ProductBadgeType {
  B1G1 = "b1g1",
  BestSellers = "best_sellers",
  BundlesSaving = "bundles_saving",
  Custom = "custom",
  Exclusive = "exclusive",
  FlashSale = "flash_sale",
  FreeGift = "free_gift",
  GiftVoucher = "gift_voucher",
  HotSeller = "hot_seller",
  HourDelivery = "hour_delivery",
  InfluencersPicks = "influencers_picks",
  MaxSaving = "max_saving",
  NewArrival = "new_arrival",
  SaleEndsIn = "sale_ends_in",
  Trending = "trending",
  UseCode = "use_code",
}

export const enum ProductCardVariant {
  Bundles = "bundles",
  Single = "single",
}

export enum ProductOptionType {
  Color = "color",
  Scent = "scent",
  Size = "size_new",
}

export const enum StockStatus {
  InStock = "IN_STOCK",
  OutOfStock = "OUT_OF_STOCK",
}

export const enum WishlistState {
  None = "none",
  Wishlisted = "wishlisted",
}

export const PRODUCT_BADGE_TO_BG_CLASS_NAME = {
  [ProductBadgeType.B1G1]: "bg-label-highlight",
  [ProductBadgeType.BestSellers]: "bg-label-action",
  [ProductBadgeType.BundlesSaving]: "bg-label-critical",
  [ProductBadgeType.Custom]: "bg-label-critical",
  [ProductBadgeType.Exclusive]: "bg-label-warning",
  [ProductBadgeType.FlashSale]: "bg-label-info",
  [ProductBadgeType.FreeGift]: "bg-label-secondary",
  [ProductBadgeType.GiftVoucher]: "bg-label-positive",
  [ProductBadgeType.HotSeller]: "bg-label-success",
  [ProductBadgeType.HourDelivery]: "bg-label-alert-light",
  [ProductBadgeType.InfluencersPicks]: "bg-label-primary",
  [ProductBadgeType.MaxSaving]: "bg-label-attention",
  [ProductBadgeType.NewArrival]: "bg-label-accent",
  [ProductBadgeType.SaleEndsIn]: "bg-label-warning-strong",
  [ProductBadgeType.Trending]: "bg-label-error",
  [ProductBadgeType.UseCode]: "bg-label-deep",
} as const;

export const PRODUCT_CARD_DIMENSIONS = {
  [ProductCardVariant.Bundles]: {
    default: { h: 163, w: 220 },
    hover: { h: 147, w: 200 },
  },
  [ProductCardVariant.Single]: {
    default: { h: 172, w: 172 },
    hover: { h: 152, w: 152 },
  },
} as const;

export const PRODUCT_CARD_COLOR_SWATCH_MAX_VISIBLE = {
  [ProductCardVariant.Bundles]: 8,
  [ProductCardVariant.Single]: 6,
} as const;

export const PRODUCT_CARD_SIZE_OPTION_MAX_VISIBLE = {
  [ProductCardVariant.Bundles]: 4,
  [ProductCardVariant.Single]: 3,
} as const;
