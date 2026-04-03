export const enum SessionStorageKey {
  AMPLITUDE_CAMPAIGN_DATA = "amplitude-campaign-data",
  ANALYTICS_LAUNCH_TRACKED = "analytics-launch-tracked",
  ANALYTICS_PRODUCT_REVIEW_CAME_FROM_ADD = "analytics_product_review_came_from_add",
  CUSTOMER_EMAIL = "customer-email",
  OPEN_APP_POPUP_SHOWN = "open-app-popup-shown",
  PAYMENT_METHOD_INFO = "payment-method-info",
  PENDING_WISHLIST_ACTIONS = "pending-wishlist-actions",
  /** Set before redirecting to payment-success/refill-cart; skip launch event on return */
  SKIP_LAUNCH_ON_CHECKOUT_RETURN = "skip-launch-on-checkout-return",
}
