export const MUTATION_KEYS = {
  CART: {
    ADD: ({
      locale,
      selectedOptionId,
      sku,
    }: {
      locale: string;
      selectedOptionId?: string;
      sku: string;
    }) => ["cart", "add", locale, sku, selectedOptionId || ""],
    ADD_WITH_GIFT_MESSAGE: ({
      locale,
      sku,
    }: {
      locale: string;
      sku: string;
    }) => ["cart", "add-with-gift-message", locale, sku],
    APPLY_REWARD_POINTS: ({ locale }: { locale: string }) => [
      "cart",
      "apply-reward-points",
      locale,
    ],
    REMOVE: ({ locale, sku }: { locale: string; sku: string }) => [
      "cart",
      "remove",
      locale,
      sku,
    ],
    REMOVE_REWARD_POINTS: ({ locale }: { locale: string }) => [
      "cart",
      "remove-reward-points",
      locale,
    ],
    UPDATE: ({ locale, sku }: { locale: string; sku: string }) => [
      "cart",
      "update",
      locale,
      sku,
    ],
    VALIDATE_BIN: ({ locale }: { locale: string }) => [
      "cart",
      "validate-bin",
      locale,
    ],
  },
  CHECKOUT: {
    CHECKOUT_APPLE_PAY: ({ locale }: { locale: string }) => [
      "checkout",
      "apple-pay",
      locale,
    ],
  },
  COUPON: {
    APPLY: ({ locale }: { locale: string }) => ["coupon", "apply", locale],
    REMOVE: ({ locale }: { locale: string }) => ["coupon", "remove", locale],
  },
  MOKAFAA: {
    AUTHENTICATE: ({ locale }: { locale: string }) => [
      "mokafaa",
      "authenticate",
      locale,
    ],
    REDEEM: ({ locale }: { locale: string }) => ["mokafaa", "redeem", locale],
    REVERSE: ({ locale }: { locale: string }) => ["mokafaa", "reverse", locale],
  },
  STOCK_NOTIFICATION: {
    SUBSCRIBE: ({
      locale,
      productId,
    }: {
      locale: string;
      productId: string;
    }) => ["stock-notification", "subscribe", locale, productId],
  },
  WISHLIST: {
    ADD: ({
      locale,
      selectedOptionId,
      sku,
    }: {
      locale: string;
      selectedOptionId?: string;
      sku: string;
    }) => ["wishlist", "add", locale, sku, selectedOptionId || ""],
    MOVE_TO_CART: ({ locale, sku }: { locale: string; sku: string }) => [
      "wishlist",
      "move-to-cart",
      locale,
      sku,
    ],
    REMOVE: ({
      locale,
      selectedOptionId,
      sku,
    }: {
      locale: string;
      selectedOptionId?: string;
      sku: string;
    }) => ["wishlist", "remove", locale, sku, selectedOptionId || ""],
  },
} as const;
