import { analyticsManager } from "@/lib/analytics/analytics-manager";
import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import { amplitudeProvider } from "@/lib/analytics/providers/amplitude-provider";
import { ROUTES } from "@/lib/constants/routes";
import { ShippingType } from "@/lib/utils/checkout/shipping-type";

// Import utility functions for use in this file
import {
  buildCartProperties,
  buildUserProperties,
} from "../utils/build-properties";
import { serializeClickOrigin } from "../utils/serialize-click-origin";

import type {
  CartProperties,
  CategoryItemsSoldProperties,
  CategoryProperties,
  DesktopNavigationProperties,
  LpProperties,
  OrderProperties,
  ProductProperties,
  PurchaseProperties,
  RateProperties,
  StoreProperties,
  UserProperties,
} from "../models/event-models";
import type { CustomerProperties } from "../utils/build-properties";
import type { Cart } from "@/lib/models/cart";
import type { Customer } from "@/lib/models/customer";

// Reset user properties and user_id (for logout)
export function resetUserProperties(): void {
  analyticsManager.resetUser();
}

// Set user properties (for Amplitude) - call once on login/signup
// Amplitude auto-attaches user properties to all subsequent events
export function setUserProperties(user: Partial<UserProperties>): void {
  if (!analyticsManager.isToolEnabled(ANALYTICS_TOOL.AMPLITUDE)) {
    return;
  }

  amplitudeProvider.setUserProperties(user);
}

// Set user properties from Customer model or customer properties
export function setUserPropertiesFromCustomer(
  customer: Customer | CustomerProperties
): void {
  setUserProperties(buildUserProperties(customer));
}

// Event: add_card - triggers when user adds a new credit card
export function trackAddCard(
  source: "account" | "checkout",
  cardListSize: number
): void {
  analyticsManager.track("add_card", {
    card_list_size: cardListSize,
    source,
  });
}

// Event: add_gift - triggers when a gift is added to cart
export function trackAddGift(cartProperties: Partial<CartProperties>): void {
  analyticsManager.track("add_gift", cartProperties);
}

// Event: addressbook_delete_address - triggers when address is removed
export function trackAddressbookDeleteAddress(): void {
  analyticsManager.track("addressbook_delete_address");
}

// Event: add_to_cart - triggers when a product is added to cart
// Includes last clicked banner attributes (elementId & categoryId) if available
// Includes click origin information if available
// Includes items_ids (item ID in cart) by matching product SKU
// Includes cart properties (grandTotal, subtotal, discounts, etc.) if cart is provided
export function trackAddToCart(
  product: Partial<ProductProperties>,
  cart?: Cart | null,
  currency?: string
): void {
  const lastClickedBanner = bannerTrackingManager.getLastClickedBanner();
  const clickOrigin = clickOriginTrackingManager.getClickOrigin();

  const eventProperties: Partial<ProductProperties> & Record<string, unknown> =
    {
      ...product,
    };

  // Add cart properties if cart is available
  if (cart) {
    const cartProperties = buildCartProperties(cart);
    Object.assign(eventProperties, cartProperties);
  }

  // Determine location based on current page
  // location = "pp" if added from product page, "plp" if from product listing page, "lp" if from landing page or home page
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    // With next-intl, pathname will be like /en, /en/, /ar, /ar/, /en/p/..., /ar/c/..., /en/lp/..., etc.
    // Remove locale prefix (e.g., /en, /en/, /ar, /ar/) to get the actual route
    // Handle both cases: with trailing slash (/en/) and without (/en)
    const pathWithoutLocale = pathname.replace(
      /^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/,
      "/"
    );
    const normalizedPath = pathWithoutLocale === "" ? "/" : pathWithoutLocale;

    // Check if it's home page (normalized path is just "/")
    if (normalizedPath === "/" || normalizedPath === ROUTES.HOME) {
      eventProperties.location = "lp";
    } else if (pathname.includes("/lp/")) {
      eventProperties.location = "lp";
    } else if (pathname.includes("/p/")) {
      eventProperties.location = "pp";
    } else if (pathname.includes("/c/")) {
      eventProperties.location = "plp";
    }
  }

  // Add click origin information (takes precedence over banner tracking for origin)
  const clickOriginProps = serializeClickOrigin(clickOrigin);
  Object.assign(eventProperties, clickOriginProps);

  // Add last clicked banner attributes if available (for backward compatibility)
  // Only add banner attributes if click origin doesn't already provide origin info
  if (lastClickedBanner && !clickOrigin) {
    eventProperties["click.extra.lp_item_id"] = lastClickedBanner.elementId;
    if (lastClickedBanner.type) {
      eventProperties["click.extra.type"] = lastClickedBanner.type;
    }
    if (lastClickedBanner.style) {
      eventProperties["click.extra.style"] = lastClickedBanner.style;
    }
    if (lastClickedBanner.origin) {
      eventProperties["click.origin"] = lastClickedBanner.origin;
    }
    if (lastClickedBanner.innerPosition !== undefined) {
      eventProperties["click.extra.inner_position"] =
        lastClickedBanner.innerPosition;
    }
    if (lastClickedBanner.lpId) {
      eventProperties["click.lp_id"] = lastClickedBanner.lpId;
    }
    if (lastClickedBanner.categoryId) {
      eventProperties["click.extra.categoryId"] = lastClickedBanner.categoryId;
    }
  }

  // When adding from PDP and no click.origin from banner/click tracking, set to "pdp"
  if (eventProperties.location === "pp") {
    eventProperties["click.origin"] = "pdp";
  }

  if (currency) {
    eventProperties.currency = currency;
  }

  analyticsManager.track("add_to_cart", eventProperties);
}

// Event: add_to_wishlist - triggers when a product is added to wishlist
// Includes click origin and location (same pattern as add_to_cart)
export function trackAddToWishlist(product: Partial<ProductProperties>): void {
  const lastClickedBanner = bannerTrackingManager.getLastClickedBanner();
  const clickOrigin = clickOriginTrackingManager.getClickOrigin();

  const eventProperties: Partial<ProductProperties> & Record<string, unknown> =
    { ...product };

  // location = "pp" if from product page, "plp" if from product listing page, "lp" if from landing page or home
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    const pathWithoutLocale = pathname.replace(
      /^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/,
      "/"
    );
    const normalizedPath = pathWithoutLocale === "" ? "/" : pathWithoutLocale;

    if (normalizedPath === "/" || normalizedPath === ROUTES.HOME) {
      eventProperties.location = "lp";
    } else if (pathname.includes("/lp/")) {
      eventProperties.location = "lp";
    } else if (pathname.includes("/p/")) {
      eventProperties.location = "pp";
    } else if (pathname.includes("/c/")) {
      eventProperties.location = "plp";
    }
  }

  const clickOriginProps = serializeClickOrigin(clickOrigin);
  Object.assign(eventProperties, clickOriginProps);

  if (lastClickedBanner && !clickOrigin) {
    eventProperties["click.extra.lp_item_id"] = lastClickedBanner.elementId;
    if (lastClickedBanner.type) {
      eventProperties["click.extra.type"] = lastClickedBanner.type;
    }
    if (lastClickedBanner.style) {
      eventProperties["click.extra.style"] = lastClickedBanner.style;
    }
    if (lastClickedBanner.origin) {
      eventProperties["click.origin"] = lastClickedBanner.origin;
    }
    if (lastClickedBanner.innerPosition !== undefined) {
      eventProperties["click.extra.inner_position"] =
        lastClickedBanner.innerPosition;
    }
    if (lastClickedBanner.lpId) {
      eventProperties["click.lp_id"] = lastClickedBanner.lpId;
    }
    if (lastClickedBanner.categoryId) {
      eventProperties["click.extra.categoryId"] = lastClickedBanner.categoryId;
    }
  }

  // When adding from PDP and no click.origin from banner/click tracking, set to "pdp"
  if (eventProperties.location === "pp") {
    eventProperties["click.origin"] = "pdp";
  }

  analyticsManager.track("add_to_wishlist", eventProperties);
}

// Event: applepay_close - triggers when applepay drawer closed/payment failed
export function trackApplepayClose(
  properties: Partial<
    {
      shipping_type?: "Click Collect" | "Home Delivery";
    } & OrderProperties
  >
): void {
  analyticsManager.track("applepay_close", properties);
}

// Event: back_to_fodel - triggers when the user goes back from the Fodel popup/page
export function trackBackToFodel(): void {
  analyticsManager.track("back_to_fodel");
}

// Event: back_to_redbox - triggers when the user goes back from the Redbox popup/page
export function trackBackToRedbox(): void {
  analyticsManager.track("back_to_redbox");
}

// Event: back_to_shipping_type - triggers when the back button is clicked from Redbox or Fodel popup/page
export function trackBackToShippingType(): void {
  analyticsManager.track("back_to_shipping_type");
}

// Event: billing_info_error - triggers when the "continue" button is clicked and info is entered incorrectly
export function trackBillingInfoError(type?: ShippingType): void {
  analyticsManager.track("billing_info_error", type ? { type } : undefined);
}

// Event: buy_now - triggers when buy now button is clicked
export function trackBuyNow(product: Partial<ProductProperties>): void {
  analyticsManager.track("buy_now", product);
}

// Event: cancel_checkout - triggers when user clicks on back from order review screen
export function trackCancelCheckout(
  properties?: Record<string, unknown>
): void {
  analyticsManager.track("cancel_checkout", properties);
}

// Event: cancel_order - triggers when cancel button clicked from popup of cancel permission in order detail screen
export function trackCancelOrder(orderId: string): void {
  analyticsManager.track("cancel_order", { order_id: orderId });
}

// Event: cart_lessqty - triggers when Product Qty is decreased
export function trackCartLessQty(
  cart: Partial<CartProperties>,
  product: Partial<ProductProperties>
): void {
  analyticsManager.track("cart_lessqty", {
    action: "decrease",
    "product.id": product["product.id"],
    // ...cart,
    // ...product,
  });
}

// Event: cart_moreqty - triggers when Product Qty is increased
export function trackCartMoreQty(
  cart: Partial<CartProperties>,
  product: Partial<ProductProperties>
): void {
  analyticsManager.track("cart_moreqty", {
    action: "increase",
    "product.id": product["product.id"],
    // ...cart,
    // ...product,
  });
}

// Event: cart_promocode_error - triggers when there is a failed response at coupon code
export function trackCartPromocodeError(
  cart: Partial<CartProperties>,
  coupon?: string
): void {
  analyticsManager.track("cart_promocode_error", {
    ...cart,
    ...(coupon && { coupon }),
  });
}

// Event: cart_promocode_ok - triggers when discount applied successfully
export function trackCartPromocodeOk(
  cart: Partial<CartProperties>,
  coupon?: string
): void {
  analyticsManager.track("cart_promocode_ok", {
    ...cart,
    ...(coupon && { coupon }),
  });
}

// Event: cart_promocode_view_expand - triggers when coupon dialog opens in cart page
export function trackCartPromocodeViewExpand(): void {
  analyticsManager.track("cart_promocode_view_expand");
}

// Event: cart_remove - triggers when a Product is removed from cart
export function trackCartRemove(
  cart: Partial<CartProperties>,
  product: Partial<ProductProperties>
): void {
  analyticsManager.track("cart_remove", {
    ...cart,
    ...product,
  });
}

// Event: cart_to_wishlist - triggers when a Product is added to wishlist from cart
export function trackCartToWishlist(
  cart: Partial<CartProperties>,
  product: Partial<ProductProperties>
): void {
  analyticsManager.track("cart_to_wishlist", {
    ...cart,
    ...product,
  });
}

// Event: cat_beauty_items_sold - triggers when purchase is successful and products are of beauty type
export function trackCatBeautyItemsSold(
  properties: Partial<CategoryItemsSoldProperties>
): void {
  analyticsManager.track("cat_beauty_items_sold", properties);
}

// Event: cat_fragrance_items_sold - triggers when purchase is successful and products are of fragrance type
export function trackCatFragranceItemsSold(
  properties: Partial<CategoryItemsSoldProperties>
): void {
  analyticsManager.track("cat_fragrance_items_sold", properties);
}

// Event: cat_mix_items_sold - triggers when purchase is successful and products are of mixed types
export function trackCatMixItemsSold(
  properties: Partial<CategoryItemsSoldProperties>
): void {
  analyticsManager.track("cat_mix_items_sold", properties);
}

// Event: cc_payment_cancel - triggers when user cancels cc payment by clicking back button
export function trackCcPaymentCancel(cart: Partial<CartProperties>): void {
  analyticsManager.track("cc_payment_cancel", cart);
}

// Event: change_payment_method - triggers when user opts to change the payment method by clicking the 'change' button in checkout screen
export function trackChangePaymentMethod(): void {
  analyticsManager.track("change_payment_method");
}

// Event: change_store - triggers when user switches stores
export function trackChangeStore(from: string, to: string): void {
  analyticsManager.track("change_store", { from, to });
}

// Event: checkout_address - triggers when address is loaded in checkout
export function trackCheckoutAddress(): void {
  analyticsManager.track("checkout_address");
}

// Event: checkout_address_new - triggers when user adds a new address in checkout
export function trackCheckoutAddressNew(
  cityCode?: string,
  countryCode?: string
): void {
  analyticsManager.track("checkout_address_new", {
    ...(cityCode && { city_code: cityCode }),
    ...(countryCode && { country_code: countryCode }),
  });
}

// Event: checkout_delivery_shipping_type_selection - triggers when delivery option is selected in checkout page
export function trackCheckoutDeliveryShippingTypeSelection(): void {
  analyticsManager.track("checkout_delivery_shipping_type_selection");
}

// Event: checkout_init - triggers when user clicks shopping bag icon
export function trackCheckoutInit(cart: Partial<CartProperties>): void {
  analyticsManager.track("checkout_init", cart);
}

// Event: checkout_order_review - triggers when user reaches order review screen
export function trackCheckoutOrderReview(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("checkout_order_review", properties);
}

// Event: checkout_order_review_edit_address - triggers on user editing shipping address from order review
export function trackCheckoutOrderReviewEditAddress(): void {
  analyticsManager.track("checkout_order_review_edit_address");
}

// Event: checkout_payment - triggers at payment step in checkout
export function trackCheckoutPayment(): void {
  analyticsManager.track("checkout_payment");
}

// Event: checkout_payment_cc - triggers when the selected payment method is cc
export function trackCheckoutPaymentCc(cart: Partial<CartProperties>): void {
  analyticsManager.track("checkout_payment_cc", cart);
}

// Event: checkout_payment_cc_cvc - triggers when cvc field loses focus and is not empty
export function trackCheckoutPaymentCcCvc(cart: Partial<CartProperties>): void {
  analyticsManager.track("checkout_payment_cc_cvc", cart);
}

// Event: checkout_payment_cc_date - triggers when exp.date field loses focus and is not empty
export function trackCheckoutPaymentCcDate(
  cart: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("checkout_payment_cc_date", cart);
}

// Event: checkout_payment_cc_number - triggers when card number field loses focus and is not empty
export function trackCheckoutPaymentCcNumber(
  cart: Partial<CartProperties>
): void {
  analyticsManager.track("checkout_payment_cc_number", cart);
}

// Event: checkout_payment_cod - triggers when the selected payment method is COD
export function trackCheckoutPaymentCod(cart: Partial<CartProperties>): void {
  analyticsManager.track("checkout_payment_cod", cart);
}

// Event: checkout_payment_method_saved - triggers when any of the valid payment methods is saved successfully in cart
export function trackCheckoutPaymentMethodSaved(
  cart: Partial<CartProperties>,
  paymentMethod?: string
): void {
  analyticsManager.track("checkout_payment_method_saved", {
    ...cart,
    ...(paymentMethod && { payment_method: paymentMethod }),
  });
}

// Event: checkout_payment_tabby_installments - triggers when tabby is selected as payment
export function trackCheckoutPaymentTabbyInstallments(
  cart: Partial<CartProperties>
): void {
  analyticsManager.track("checkout_payment_tabby_installments", cart);
}

// Event: checkout_tamara_pay_by_installment - triggers when tamara installment is selected as payment
export function trackCheckoutPaymentTamaraPayByInstalments(
  cart: Partial<CartProperties>
): void {
  analyticsManager.track("checkout_tamara_pay_by_installment", cart);
}

// Event: checkout_promocode - triggers when a coupon apply is attempted in checkout screen
export function trackCheckoutPromocode(
  cart: Partial<CartProperties>,
  coupon?: string
): void {
  analyticsManager.track("checkout_promocode", {
    ...cart,
    ...(coupon && { coupon }),
  });
}

// Event: checkout_promocode_error - triggers when a coupon apply is failure in checkout screen
export function trackCheckoutPromocodeError(
  cart: Partial<CartProperties>,
  coupon?: string
): void {
  analyticsManager.track("checkout_promocode_error", {
    ...cart,
    ...(coupon && { coupon }),
  });
}

// Event: checkout_promocode_ok - triggers when a coupon apply is successful in checkout screen
export function trackCheckoutPromocodeOk(
  cart: Partial<CartProperties>,
  coupon?: string
): void {
  analyticsManager.track("checkout_promocode_ok", {
    ...cart,
    ...(coupon && { coupon }),
  });
}

// Event: checkout_promocode_view_expand - triggers when coupon dialog opens in checkout screen
export function trackCheckoutPromocodeViewExpand(): void {
  analyticsManager.track("checkout_promocode_view_expand");
}

// Event: checkout_submit_error - triggers when place order button clicked but form is invalid
export function trackCheckoutSubmitError(
  cart: Partial<CartProperties>,
  paymentMethod?: string,
  shippingMethod?: string
): void {
  analyticsManager.track("checkout_submit_error", {
    ...cart,
    ...(paymentMethod && { payment_method: paymentMethod }),
    ...(shippingMethod && { shipping_method: shippingMethod }),
  });
}

// Event: checkout_wrapping - triggers when user reaches gift wrapping screen
export function trackCheckoutWrapping(
  properties?: Partial<CartProperties>
): void {
  analyticsManager.track("checkout_wrapping", properties);
}

// Event: confirm_billing_info - triggers when the "continue" button is clicked and all info is entered correctly
export function trackConfirmBillingInfo(type?: ShippingType): void {
  analyticsManager.track("confirm_billing_info", type ? { type } : undefined);
}

// Event: continue_shopping - triggers when continue shopping button is clicked
export function trackContinueShopping(
  source: "cart-drawer" | "cart" | "lp" | "pdp" | "plp"
): void {
  analyticsManager.track("continue_shopping", { source });
}

// Event: cs_call - triggers when call us button is clicked in assistance menu
export function trackCsCall(): void {
  analyticsManager.track("cs_call");
}

// Event: cs_email - triggers when email us option in customer service screen is clicked
export function trackCsEmail(): void {
  analyticsManager.track("cs_email");
}

// Event: cs_open - triggers when customer service screen is opened
export function trackCsOpen(): void {
  analyticsManager.track("cs_open");
}

// Event: cs_whatsapp - triggers when user clicks the whatsapp number in the footer
export function trackCsWhatsapp(): void {
  analyticsManager.track("cs_whatsapp");
}

// Event: delete_card - triggers when user deletes a credit card
export function trackDeleteCard(
  cardListSize: number,
  source: "account" | "checkout"
): void {
  analyticsManager.track("delete_card", {
    card_list_size: cardListSize,
    source,
  });
}

// Event: delete_user - triggers when user deletes their account
export function trackDeleteUser(): void {
  analyticsManager.track("delete_user");
}

// Event: desktop_navigation - triggers on desktop nav click
// Include title, url_type ("brands" | "category" | "lp"), and category_id when applicable
export function trackDesktopNavigation(
  props: {
    lp_id: string;
    lp_name: string;
    type: string;
  } & Partial<DesktopNavigationProperties>,
  category?: Partial<CategoryProperties>
): void {
  analyticsManager.track("desktop_navigation", {
    ...props,
    ...category,
  });
}

// Event: edit_profile - triggers when user updates profile after a fresh login (signup)
export function trackEditProfile(user?: Partial<UserProperties>): void {
  analyticsManager.track("edit_profile", user);
}

// Event: empty_search_results_fodel - triggers when the user searches for something but no results are shown for Fodel
export function trackEmptySearchResultsFodel(searchText?: string): void {
  analyticsManager.track(
    "empty_search_results_fodel",
    searchText ? { search_text: searchText } : undefined
  );
}

// Event: empty_search_results_redbox - triggers when the user searches for something but no results are shown for Redbox
export function trackEmptySearchResultsRedbox(searchText?: string): void {
  analyticsManager.track(
    "empty_search_results_redbox",
    searchText ? { search_text: searchText } : undefined
  );
}

// Event: faq_page_open - triggers when FAQ page link is opened
export function trackFaqPageOpen({ section }: { section: string }): void {
  analyticsManager.track("faq_page_open", { section });
}

// Event: filter_apply - triggers when user applies filters to PLP
export function trackFilterApply(): void {
  analyticsManager.track("filter_apply");
}

// Event: filter_close - triggers when user closes filter in any PLP
export function trackFilterClose(): void {
  analyticsManager.track("filter_close");
}

// Event: filter_open - triggers when user clicks on filter in any PLP
export function trackFilterOpen(): void {
  analyticsManager.track("filter_open");
}

// Event: fodel_point_search - triggers when the search bar is clicked for Fodel points
export function trackFodelPointSearch(): void {
  analyticsManager.track("fodel_point_search");
}

// Event: gift_edit - triggers when a gift is edited in cart
export function trackGiftEdit(cartProperties: Partial<CartProperties>): void {
  analyticsManager.track("gift_edit", cartProperties);
}

// Event: go_on_app - triggers when user clicks "go on app" in open-app prompt
export function trackGoOnApp(): void {
  analyticsManager.track("go_on_app");
}

// Event: g_purchase - triggers when a purchase is success on order-confirmation page (same as purchase_success)
export function trackGPurchase(properties: Partial<PurchaseProperties>): void {
  analyticsManager.track("g_purchase", properties);
}

// Event: home - triggers on home page view
export function trackHome(): void {
  analyticsManager.track("home");
}

// Event: invite_friend - triggers when user clicks invite friends button
export function trackInviteFriend(): void {
  analyticsManager.track("invite_friend");
}

// Event: langauge_pick - triggers when user changes country or language
export function trackLanguagePick(store: Partial<StoreProperties>): void {
  analyticsManager.track("langauge_pick", store);
}

// Event: launch - triggers on app initialization
// Pass user properties when available so launch event includes user data (e.g. for logged-in users)
export function trackLaunch(
  userProperties?: null | Partial<UserProperties>
): void {
  analyticsManager.track("launch", userProperties ?? undefined);
}

// Event: login - triggers on successful login
// User properties should be set separately via setUserPropertiesFromCustomer
// User data can also be included in the event properties
export function trackLogin(user?: Partial<UserProperties>): void {
  analyticsManager.track("login", user);
}

// Event: login_attempt - triggers when user tries to login
export function trackLoginAttempt(): void {
  analyticsManager.track("login_attempt");
}

// Event: logout - triggers when user logs out
export function trackLogout(): void {
  analyticsManager.track("logout");
}

// Event: menu_click - triggers when user selects a tab in bottom navigation
export function trackMenuClick(menu: string): void {
  analyticsManager.track("menu_click", {
    menu,
  });
}

// Event: micro_cart_close - triggers when cart drawer closes
export function trackMicroCartClose(
  cart?: null | Partial<CartProperties>
): void {
  analyticsManager.track("micro_cart_close", cart ?? undefined);
}

// Event: mokafaa_amount_error - triggers when there is an amount error in Mokaffa flow
export function trackMokafaaAmountError(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_amount_error", properties);
}

// Event: mokafaa_edit_phone_number - triggers when user edits phone number in Mokaffa flow
export function trackMokafaaEditPhoneNumber(): void {
  analyticsManager.track("mokafaa_edit_phone_number");
}

// Event: mokafaa_old_otp_valid - triggers when old OTP is still valid in Mokaffa flow
export function trackMokafaaOldOtpValid(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_old_otp_valid", properties);
}

// Event: mokafaa_otp_error - triggers when there is an OTP error in Mokaffa flow
export function trackMokafaaOtpError(
  properties?: Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_otp_error", properties);
}

// Event: mokafaa_otp_resend - triggers when user resends OTP in Mokaffa flow
export function trackMokafaaOtpResend(
  properties?: Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_otp_resend", properties);
}

// Event: mokafaa_phone_validation_failure - triggers when phone validation fails in Mokaffa flow
export function trackMokafaaPhoneValidationFailure(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_phone_validation_failure", properties);
}

// Event: mokafaa_phone_validation_success - triggers when phone validation succeeds in Mokaffa flow
export function trackMokafaaPhoneValidationSuccess(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_phone_validation_success", properties);
}

// Event: mokafaa_talon_error_disclaimer_shown - triggers when error disclaimer is shown (user attempts mokafaa when talon is already redeemed)
export function trackMokafaaTalonErrorDisclaimerShown(): void {
  analyticsManager.track("mokafaa_talon_error_disclaimer_shown");
}

// Event: mokafaa_transaction_reversal_attempt - triggers when user attempts to reverse Mokaffa transaction
export function trackMokafaaTransactionReversalAttempt(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_transaction_reversal_attempt", properties);
}

// Event: mokafaa_transaction_reversal_attempt_cancel - triggers when user
// cancels reversal in Mokafaa confirmation dialog
export function trackMokafaaTransactionReversalAttemptCancel(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track(
    "mokafaa_transaction_reversal_attempt_cancel",
    properties
  );
}

// Event: mokafaa_transaction_reversal_attempt_ok - triggers when user confirms
// reversal in Mokafaa confirmation dialog
export function trackMokafaaTransactionReversalAttemptOk(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_transaction_reversal_attempt_ok", properties);
}

// Event: mokafaa_transaction_reversal_success - triggers when transaction reversal is successful
export function trackMokafaaTransactionReversalSuccess(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_transaction_reversal_success", properties);
}

// Event: mokafaa_transaction_success - triggers when Mokaffa transaction is successful
export function trackMokafaaTransactionSuccess(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_transaction_success", properties);
}

// Event: mokafaa_view_expanded - triggers when mokafaa view is expanded
export function trackMokafaaViewExpanded(
  properties?: { payment_method?: string } & Partial<CartProperties>
): void {
  analyticsManager.track("mokafaa_view_expanded", properties);
}

// Event: my_wishlist - triggers when user open wishlist side bar
export function trackMyWishlist(): void {
  analyticsManager.track("my_wishlist");
}

// Event: otp_error - triggers when request OTP API failed
export function trackOtpError(properties: {
  action: string;
  error: string;
  phone: string;
  source: string;
}): void {
  analyticsManager.track("otp_error", properties);
}

// Event: otp_success - triggers when the request OTP API is successful
export function trackOtpSuccess(properties: {
  action: string;
  source: string;
}): void {
  analyticsManager.track("otp_success", properties);
}

// Event: phone_verified - triggers for those users who are already logged in and only verifying the phone either from checkout or account area
export function trackPhoneVerified(source: "account" | "checkout"): void {
  analyticsManager.track("phone_verified", { source });
}

// Event: ppfbt_close - triggers when product page FBT section is closed
export function trackPpfbtClose(): void {
  analyticsManager.track("ppfbt_close");
}

// Event: product_notify - triggers when 'notify me' option is clicked
export function trackProductNotify(product: Partial<ProductProperties>): void {
  analyticsManager.track("product_notify", product);
}

// Event: product_rate - triggers when user sends a product rate
export function trackProductRate(
  product: Partial<ProductProperties>,
  rate: Partial<RateProperties>
): void {
  analyticsManager.track("product_rate", {
    ...product,
    ...rate,
  });
}

// Event: product_review - triggers when product review screen is loaded
export function trackProductReview(product: Partial<ProductProperties>): void {
  analyticsManager.track("product_review", product);
}

// Event: profile_updated - triggers when user's profile updated from address form, ticketing etc
export function trackProfileUpdated(user?: Partial<UserProperties>): void {
  analyticsManager.track("profile_updated", user);
}

// Event: purchase - triggers when purchase is successful on order-confirmation page
// Should only be called from order-confirmation page with specific properties
export function trackPurchase(purchase: Partial<PurchaseProperties>): void {
  analyticsManager.track("purchase", purchase);
}

// Event: purchase_attempt - triggers when a purchase button is clicked (when a purchase is initiated)
export function trackPurchaseAttempt(
  cart: Partial<CartProperties>,
  paymentMethod?: string,
  shippingMethod?: string
): void {
  analyticsManager.track("purchase_attempt", {
    ...cart,
    ...(paymentMethod && { payment_method: paymentMethod }),
    ...(shippingMethod && { shipping_method: shippingMethod }),
  });
}

// Event: purchase_error - triggers when place order fails
export function trackPurchaseError(
  cart: Partial<CartProperties>,
  paymentMethod?: string,
  shippingMethod?: string
): void {
  analyticsManager.track("purchase_error", {
    ...cart,
    ...(paymentMethod && { payment_method: paymentMethod }),
    ...(shippingMethod && { shipping_method: shippingMethod }),
  });
}

// Event: purchase_paymenterror - triggers when cc payment failed or tokenization failed (including Apple Pay)
export function trackPurchasePaymentError(
  cart: Partial<CartProperties>,
  paymentMethod?: string,
  shippingMethod?: string
): void {
  analyticsManager.track("purchase_paymenterror", {
    ...cart,
    ...(paymentMethod && { payment_method: paymentMethod }),
    ...(shippingMethod && { shipping_method: shippingMethod }),
  });
}

// Event: purchase_success - triggers when a purchase is success on order-confirmation page
export function trackPurchaseSuccess(
  properties: Partial<PurchaseProperties>
): void {
  analyticsManager.track("purchase_success", properties);
}

// Event: quick_action - triggers when any action is clicked from order detail screen
export function trackQuickAction(action: string): void {
  analyticsManager.track("quick_action", {
    action,
  });
}

// Event: redbox_point_search - triggers when the search bar is clicked for Redbox points
export function trackRedboxPointSearch(): void {
  analyticsManager.track("redbox_point_search");
}

// Event: request_otp - triggers when OTP is requested (phone number entry screen or resend OTP)
export function trackRequestOtp(properties: {
  action: string;
  otp_sender_type: "sms" | "whatsapp";
  phone_number: string;
  source: string;
}): void {
  analyticsManager.track("request_otp", properties);
}

// Event: request_otp_error - triggers when OTP entered by user is incorrect
export function trackRequestOtpError(properties: {
  action: string;
  error: string;
  phone_number?: string;
  source?: string;
}): void {
  analyticsManager.track("request_otp_error", properties);
}

// Event: Revenue - triggers when a purchase is success on order-confirmation page (same as purchase_success)
export function trackRevenue(properties: Partial<PurchaseProperties>): void {
  analyticsManager.track("Revenue", properties);
}

// Event: review_action - triggers when a user marks a review as helpful or report it
export function trackReviewAction(
  action: "like" | "report",
  reviewId: number,
  productId?: number | string
): void {
  analyticsManager.track("review_action", {
    action,
    review_id: reviewId,
    ...(productId && { "product.id": String(productId) }),
  });
}

// Event: search_freetext - triggers when a text is submitted in the searchview
export function trackSearchFreetext(searchQuery?: string): void {
  analyticsManager.track("search_freetext", {
    ...(searchQuery && { search_text: searchQuery }),
  });
}

// Event: search_init - triggers when search screen is present
export function trackSearchInit(): void {
  analyticsManager.track("search_init");
}

// Event: search_recent - triggers when an item in search history is selected
export function trackSearchRecent(searchTerm: string): void {
  analyticsManager.track("search_recent", {
    search_text: searchTerm,
  });
}

// Event: search_suggestion - triggers when an item in search suggestion is selected
export function trackSearchSuggestion(
  suggestion: string,
  searchText?: string,
  category?: string
): void {
  analyticsManager.track("search_suggestion", {
    category,
    search_text: suggestion,
    suggestion,
  });
  analyticsManager.track("view_category", {
    "category.id": suggestion,
    "category.name": suggestion,
  });
}

// Event: select_area - triggers when user selects area in address form
export function trackSelectArea(): void {
  analyticsManager.track("select_area");
}

// Event: select_city - triggers when user selects city in address form
export function trackSelectCity(): void {
  analyticsManager.track("select_city");
}

// Event: select_fodel - triggers when Fodel shipping option is selected in shipping option drawer
export function trackSelectFodel(): void {
  analyticsManager.track("select_fodel");
}

// Event: select_fodel_point_from_list - triggers when a point is selected from the list for Fodel
export function trackSelectFodelPointFromList(): void {
  analyticsManager.track("select_fodel_point_from_list");
}

// Event: select_fodel_point_from_map - triggers when a point is selected on the map for Fodel
export function trackSelectFodelPointFromMap(): void {
  analyticsManager.track("select_fodel_point_from_map");
}

// Event: select_redbox - triggers when Redbox shipping option is selected in shipping option drawer
export function trackSelectRedbox(): void {
  analyticsManager.track("select_redbox");
}

// Event: select_redbox_point_from_list - triggers when a point is selected from the list for Redbox
export function trackSelectRedboxPointFromList(): void {
  analyticsManager.track("select_redbox_point_from_list");
}

// Event: select_redbox_point_from_map - triggers when a point is selected on the map for Redbox
export function trackSelectRedboxPointFromMap(): void {
  analyticsManager.track("select_redbox_point_from_map");
}

// Event: settings_open - triggers when each section on account area is clicked
export function trackSettingsOpen(section: string): void {
  analyticsManager.track("settings_open", { section });
}

// Event: shipping_type_selection - triggers when user clicks on shipping type options from checkout screen
export function trackShippingTypeSelection(type: ShippingType): void {
  analyticsManager.track("shipping_type_selection", { type });
}

// Event: signup - triggers on successful signup
// User properties should be set separately via setUserPropertiesFromCustomer
// User data can also be included in the event properties
export function trackSignup(user?: Partial<UserProperties>): void {
  analyticsManager.track("signup", user);
}

// Event: stay_on_web - triggers when user clicks "stay on web" in open-app prompt
export function trackStayOnWeb(): void {
  analyticsManager.track("stay_on_web");
}

// Event: tabby_close - triggers when user cancels tabby payment page by clicking back button
export function trackTabbyClose(
  properties: Partial<
    {
      shipping_type?: "Click Collect" | "Home Delivery";
    } & OrderProperties
  >
): void {
  analyticsManager.track("tabby_close", properties);
}

// Event: tabby_purchase_error - triggers when tabby payment encounters an error
export function trackTabbyPurchaseError(
  properties: Partial<
    {
      payment_method?: string;
      shipping_type?: "Click Collect" | "Home Delivery";
    } & CartProperties
  >
): void {
  analyticsManager.track("tabby_purchase_error", properties);
}

// Event: tabby_purchase_success - triggers on order-confirmation page for a tabby order after successful payment
export function trackTabbyPurchaseSuccess(
  properties: Partial<
    {
      shipping_type?: "Click Collect" | "Home Delivery";
    } & CartProperties
  >
): void {
  analyticsManager.track("tabby_purchase_success", properties);
}

// Event: tabby_view_learn_more - triggers when user clicks learn more in tabby payment cell
export function trackTabbyViewLearnMore(): void {
  analyticsManager.track("tabby_view_learn_more");
}

// Event: talon_mokafaa_error_disclaimer_shown - triggers when error disclaimer is shown (user attempts to redeem talon when mokafaa is already redeemed)
export function trackTalonMokafaaErrorDisclaimerShown(): void {
  analyticsManager.track("talon_mokafaa_error_disclaimer_shown");
}

// Event: tamara_close - triggers when user cancels tamara payment page by clicking back button
export function trackTamaraClose(
  properties: Partial<
    {
      shipping_type?: "Click Collect" | "Home Delivery";
    } & OrderProperties
  >
): void {
  analyticsManager.track("tamara_close", properties);
}

// Event: tamara_purchase_error - triggers when tamara payment encounters an error
export function trackTamaraPurchaseError(
  properties: Partial<
    {
      payment_method?: string;
      shipping_type?: "Click Collect" | "Home Delivery";
    } & CartProperties
  >
): void {
  analyticsManager.track("tamara_purchase_error", properties);
}

// Event: tamara_purchase_success - triggers on order-confirmation page for a tamara order after successful payment
export function trackTamaraPurchaseSuccess(
  properties: Partial<
    {
      shipping_type?: "Click Collect" | "Home Delivery";
    } & CartProperties
  >
): void {
  analyticsManager.track("tamara_purchase_success", properties);
}

// Event: tamara_view_learn_more - triggers when user clicks learn more in tamara payment cell
export function trackTamaraViewLearnMore(): void {
  analyticsManager.track("tamara_view_learn_more");
}

// Event: toggle_category - triggers when user clicks on the toggle button in home page to change the home page
export function trackToggleCategory(categoryId: string): void {
  analyticsManager.track("toggle_category", { category_id: categoryId });
}

// Event: track_order - triggers when order detail screen is loaded
export function trackTrackOrder(order: Partial<OrderProperties>): void {
  analyticsManager.track("track_order", order);
}

// Event: use_this_location_fodel - triggers when the "use this location" button is clicked for Fodel
export function trackUseThisLocationFodel(): void {
  analyticsManager.track("use_this_location_fodel");
}

// Event: use_this_location_redbox - triggers when the "use this location" button is clicked for Redbox
export function trackUseThisLocationRedbox(): void {
  analyticsManager.track("use_this_location_redbox");
}

// Event: verification_sms_detected - triggers when all OTP digits are filled (user completed the OTP field)
export function trackVerificationSmsDetected(properties: {
  phone: string;
}): void {
  analyticsManager.track("verification_sms_detected", properties);
}

// Event: view_account - triggers when users visits my account section
export function trackViewAccount(): void {
  analyticsManager.track("view_account");
}

// Event: view_cart - triggers when cart screen is loaded
export function trackViewCart(cart: Partial<CartProperties>): void {
  analyticsManager.track("view_cart", cart);
}

// Event: view_catalog - triggers when catalog page is loaded (web only)
// Includes click origin information if available
export function trackViewCatalog(catalog: Partial<CategoryProperties>): void {
  const clickOrigin = clickOriginTrackingManager.getClickOrigin();

  const eventProperties: Partial<CategoryProperties> & Record<string, unknown> =
    {
      ...catalog,
    };

  // Add click origin information
  const clickOriginProps = serializeClickOrigin(clickOrigin);
  Object.assign(eventProperties, clickOriginProps);

  analyticsManager.track("view_catalog", eventProperties);
}

// Event: view_category - triggers on Product Listing Page (PLP)
// Includes click origin information if available
export function trackViewCategory(category: Partial<CategoryProperties>): void {
  const lastClickedBanner = bannerTrackingManager.getLastClickedBanner();
  const clickOrigin = clickOriginTrackingManager.getClickOrigin();

  const eventProperties: Partial<CategoryProperties> & Record<string, unknown> =
    {
      ...category,
    };

  // Add click origin information (takes precedence over banner tracking for origin)
  const clickOriginProps = serializeClickOrigin(clickOrigin);
  Object.assign(eventProperties, clickOriginProps);

  // Add last clicked banner attributes if available (for backward compatibility)
  // Only add banner attributes if click origin doesn't already provide origin info
  if (lastClickedBanner && !clickOrigin) {
    eventProperties["click.extra.lp_item_id"] = lastClickedBanner.elementId;
    if (lastClickedBanner.type) {
      eventProperties["click.extra.type"] = lastClickedBanner.type;
    }
    if (lastClickedBanner.style) {
      eventProperties["click.extra.style"] = lastClickedBanner.style;
    }
    if (lastClickedBanner.origin) {
      eventProperties["click.origin"] = lastClickedBanner.origin;
    }
    if (lastClickedBanner.innerPosition !== undefined) {
      eventProperties["click.extra.inner_position"] =
        lastClickedBanner.innerPosition;
    }
    if (lastClickedBanner.lpId) {
      eventProperties["click.lp_id"] = lastClickedBanner.lpId;
    }
    if (lastClickedBanner.categoryId) {
      eventProperties["click.extra.categoryId"] = lastClickedBanner.categoryId;
    }
  }

  analyticsManager.track("view_category", eventProperties);
}

// Event: view_lp - triggers when landing page is loaded
export function trackViewLp(lp: Partial<LpProperties>): void {
  const lastClickedBanner = bannerTrackingManager.getLastClickedBanner();

  const eventProperties: Partial<LpProperties> & Record<string, unknown> = {
    ...lp,
  };

  // Add last clicked banner attributes if available
  if (lastClickedBanner) {
    eventProperties["click.extra.lp_item_id"] = lastClickedBanner.elementId;
    if (lastClickedBanner.type) {
      eventProperties["click.extra.type"] = lastClickedBanner.type;
    }
    if (lastClickedBanner.style) {
      eventProperties["click.extra.style"] = lastClickedBanner.style;
    }
    if (lastClickedBanner.origin) {
      eventProperties["click.origin"] = lastClickedBanner.origin;
    }
    if (lastClickedBanner.innerPosition !== undefined) {
      eventProperties["click.extra.inner_position"] =
        lastClickedBanner.innerPosition;
    }
    if (lastClickedBanner.lpId) {
      eventProperties["click.lp_id"] = lastClickedBanner.lpId;
    }
    if (lastClickedBanner.categoryId) {
      eventProperties["click.extra.categoryId"] = lastClickedBanner.categoryId;
    }
  }

  analyticsManager.track("view_lp", eventProperties);
}

// Event: view_microcart - triggers when cart drawer opens
export function trackViewMicrocart(
  cart?: null | Partial<CartProperties>
): void {
  analyticsManager.track("view_microcart", cart ?? undefined);
}

// Event: view_product - triggers when product detail screen is loaded
// Includes click origin information if available
export function trackViewProduct(product: Partial<ProductProperties>): void {
  const lastClickedBanner = bannerTrackingManager.getLastClickedBanner();
  const clickOrigin = clickOriginTrackingManager.getClickOrigin();

  const eventProperties: Partial<ProductProperties> & Record<string, unknown> =
    {
      ...product,
    };

  // Add click origin information (takes precedence over banner tracking for origin)
  const clickOriginProps = serializeClickOrigin(clickOrigin);
  Object.assign(eventProperties, clickOriginProps);

  // Add last clicked banner attributes if available (for backward compatibility)
  // Only add banner attributes if click origin doesn't already provide origin info
  if (lastClickedBanner && !clickOrigin) {
    eventProperties["click.extra.lp_item_id"] = lastClickedBanner.elementId;
    if (lastClickedBanner.type) {
      eventProperties["click.extra.type"] = lastClickedBanner.type;
    }
    if (lastClickedBanner.style) {
      eventProperties["click.extra.style"] = lastClickedBanner.style;
    }
    if (lastClickedBanner.origin) {
      eventProperties["click.origin"] = lastClickedBanner.origin;
    }
    if (lastClickedBanner.innerPosition !== undefined) {
      eventProperties["click.extra.inner_position"] =
        lastClickedBanner.innerPosition;
    }
    if (lastClickedBanner.lpId) {
      eventProperties["click.lp_id"] = lastClickedBanner.lpId;
    }
    if (lastClickedBanner.categoryId) {
      eventProperties["click.extra.categoryId"] = lastClickedBanner.categoryId;
    }
  }

  analyticsManager.track("view_product", eventProperties);
}
