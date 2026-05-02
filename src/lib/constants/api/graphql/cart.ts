import { graphql } from "@/graphql";

graphql(`
  fragment CartDetailsFields on Cart {
    id
    total_quantity
    service_fee_message
    is_bullet_eligible
    mokafaa {
      enabled_for_apps
      enabled_for_web
    }
    gift_message {
      from
      message
      to
    }
    applied_coupons {
      code
    }
    prices {
      grand_total {
        value
        currency
      }
      subtotal_including_tax {
        value
        currency
      }
      small_order_fee {
        currency
        value
      }
      mokafaa_discount {
        currency
        value
      }
      discount {
        amount {
          currency
          value
        }
      }
    }
    reward_points_applied {
      base_value
      points
      points_to_earn
      points_to_spend
      reward_threshold
      threshold_message
      total_available_points
      value
    }
    applied_reward_points {
      points
      money {
        currency
        value
      }
    }
    available_payment_methods {
      code
      downtime_alert
      title
    }
    selected_payment_method {
      code
    }
    shipping_addresses {
      firstname
      lastname
      street
      city
      region {
        code
        label
      }
      country {
        code
        label
      }
      telephone
      available_shipping_methods {
        amount {
          currency
          value
        }
        carrier_code
        carrier_title
        method_code
        method_title
      }
      selected_shipping_method {
        amount {
          currency
          value
        }
        base_amount {
          currency
          value
        }
        carrier_code
        carrier_title
        method_code
        method_title
        price_incl_tax {
          currency
          value
        }
      }
    }
    itemsV2(currentPage: $page, pageSize: $pageSize, sort: $sort) {
      total_count
      items {
        uid
        quantity
        is_gwp
        is_wrap
        prices {
          price_including_tax {
            currency
            value
          }
          price {
            currency
            value
          }
          row_total {
            currency
            value
          }
          total_item_discount {
            currency
            value
          }
          discounts {
            amount {
              currency
              value
            }
            label
          }
        }
        product {
          uid
          id
          name
          brand_new_label
          sku
          url_key
          rating_summary
          short_description {
            html
          }
          thumbnail {
            url
            label
          }
          stock_status
          product_type_new2
          price_range {
            minimum_price {
              discount {
                amount_off
                percent_off
              }
              regular_price {
                currency
                value
              }
              final_price {
                currency
                value
              }
            }
          }
        }
        ... on ConfigurableCartItem {
          __typename
          attribute_set
          configurable_options {
            option_label
            value_label
            configurable_product_option_uid
            configurable_product_option_value_uid
          }
          configured_variant {
            id
            sku
            express_delivery_available
            countdown_timer_enabled
            countdown_timer_end_date
            countdown_timer_start_date
            countdown_timer_subtitle
            countdown_timer_title
            price_range {
              minimum_price {
                final_price {
                  value
                  currency
                }
                regular_price {
                  value
                  currency
                }
                discount {
                  amount_off
                  percent_off
                }
              }
            }
          }
        }
        ... on SimpleCartItem {
          attribute_set
          product {
            express_delivery_available
            countdown_timer_enabled
            countdown_timer_end_date
            countdown_timer_start_date
            countdown_timer_subtitle
            countdown_timer_title
          }
        }
      }
      page_info {
        page_size
        current_page
        total_pages
      }
    }
  }
`);

export const CART_GRAPHQL_QUERIES = {
  GET_CART_DETAILS: graphql(`
    query GetCartDetails(
      $cartId: String!
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      cart(cart_id: $cartId) {
        ...CartDetailsFields
      }
    }
  `),

  GET_CART_VALIDATION: graphql(`
    query GetCartValidation($cartId: String!) {
      cart(cart_id: $cartId) {
        id
        shipping_addresses {
          available_shipping_methods {
            amount {
              currency
              value
            }
            carrier_code
            carrier_title
            method_code
            method_title
          }
          country {
            code
          }
          selected_shipping_method {
            carrier_code
            method_code
          }
        }
        selected_payment_method {
          code
        }
      }
    }
  `),

  GET_CUSTOMER_CART_DETAILS: graphql(`
    query GetCustomerCartDetails(
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      customerCart {
        ...CartDetailsFields
      }
    }
  `),

  GET_CUSTOMER_CART_ID: graphql(`
    query GetCustomerCartId {
      customerCart {
        id
      }
    }
  `),
} as const;

export const CART_GRAPHQL_MUTATIONS = {
  ADD_PRODUCTS_TO_CART: graphql(`
    mutation AddProductsToCart(
      $cartId: String!
      $cartItems: [CartItemInput!]!
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
        user_errors {
          code
          message
        }
        cart {
          ...CartDetailsFields
        }
      }
    }
  `),

  ADD_PRODUCTS_TO_CART_WITH_GIFT_MESSAGE: graphql(`
    mutation AddProductsToCartWithGiftMessage(
      $cartId: String!
      $cartItems: [CartItemInput!]!
      $giftMessage: GiftMessageInput
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      addProductsToCartWithGiftMessage(
        input: {
          cart_id: $cartId
          cart_items: $cartItems
          gift_message: $giftMessage
        }
      ) {
        user_errors {
          code
          message
        }
        cart {
          ...CartDetailsFields
        }
        gift_message {
          from
          to
          message
        }
      }
    }
  `),

  APPLY_COUPON_TO_CART: graphql(`
    mutation ApplyCouponToCart(
      $cartId: String!
      $couponCode: String!
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      applyCouponToCart(input: { cart_id: $cartId, coupon_code: $couponCode }) {
        cart {
          ...CartDetailsFields
        }
      }
    }
  `),

  APPLY_REWARD_POINTS_TO_CART: graphql(`
    mutation ApplyRewardPointsToCart(
      $cartId: ID!
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      applyRewardPointsToCart(cartId: $cartId) {
        cart {
          ...CartDetailsFields
        }
      }
    }
  `),

  CREATE_GUEST_CART: graphql(`
    mutation CreateGuestCart {
      createGuestCart {
        cart {
          id
        }
      }
    }
  `),

  ESTIMATE_SHIPPING_METHODS: graphql(`
    mutation EstimateShippingMethods(
      $cartId: String!
      $countryCode: CountryCodeEnum!
    ) {
      estimateShippingMethods(
        input: { cart_id: $cartId, address: { country_code: $countryCode } }
      ) {
        available
        carrier_code
        carrier_title
        method_title
        method_code
        amount {
          value
          currency
        }
        shipping_method_title
        shipping_time
        shipping_days_min
        shipping_days_max
        free_over_cart_value
        cutting_time
        delivery_time
        shipping_fee
        start_hour
      }
    }
  `),

  MERGE_CARTS: graphql(`
    mutation MergeCarts(
      $source_cart_id: String!
      $destination_cart_id: String
    ) {
      mergeCarts(
        source_cart_id: $source_cart_id
        destination_cart_id: $destination_cart_id
      ) {
        id
      }
    }
  `),

  PLACE_ORDER: graphql(`
    mutation PlaceOrder($cartId: String!) {
      placeOrder(input: { cart_id: $cartId }) {
        errors {
          code
          message
        }
        orderV2 {
          billing_address {
            city
            country_code
            firstname
            lastname
            postcode
            street
            telephone
          }
          number
          payment_methods {
            name
            type
            additional_data {
              name
              value
            }
          }
          total {
            cod_fee {
              currency
              value
            }
            grand_total {
              currency
              value
            }
            mokafaa_discount {
              currency
              value
            }
          }
        }
      }
    }
  `),

  REMOVE_COUPON_FROM_CART: graphql(`
    mutation RemoveCouponFromCart(
      $cartId: String!
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      removeCouponFromCart(input: { cart_id: $cartId }) {
        cart {
          ...CartDetailsFields
        }
      }
    }
  `),

  REMOVE_ITEM_FROM_CART: graphql(`
    mutation RemoveFromCart(
      $input: RemoveItemFromCartInput!
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      removeItemFromCart(input: $input) {
        cart {
          ...CartDetailsFields
        }
      }
    }
  `),

  REMOVE_REWARD_POINTS_FROM_CART: graphql(`
    mutation RemoveRewardPointsFromCart(
      $cartId: ID!
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      removeRewardPointsFromCart(cartId: $cartId) {
        cart {
          ...CartDetailsFields
        }
      }
    }
  `),

  SET_BILLING_ADDRESS_ON_CART: graphql(`
    mutation SetBillingAddressOnCart(
      $billingAddress: BillingAddressInput!
      $cartId: String!
    ) {
      setBillingAddressOnCart(
        input: { cart_id: $cartId, billing_address: $billingAddress }
      ) {
        cart {
          available_payment_methods {
            code
            downtime_alert
            title
          }
          billing_address {
            city
            country {
              code
              label
            }
            firstname
            lastname
            postcode
            region {
              code
              label
            }
            street
            telephone
          }
          shipping_addresses {
            available_shipping_methods {
              amount {
                currency
                value
              }
              carrier_code
              carrier_title
              method_code
              method_title
            }
            city
            country {
              code
              label
            }
            firstname
            lastname
            postcode
            region {
              code
              label
            }
            street
            telephone
          }
        }
      }
    }
  `),

  SET_PAYMENT_METHOD_ON_CART: graphql(`
    mutation SetPaymentMethodOnCart(
      $cartId: String!
      $paymentMethod: PaymentMethodInput!
    ) {
      setPaymentMethodOnCart(
        input: { cart_id: $cartId, payment_method: $paymentMethod }
      ) {
        cart {
          selected_payment_method {
            code
            title
          }
          prices {
            cod_fee {
              currency
              value
            }
          }
        }
      }
    }
  `),

  SET_SHIPPING_ADDRESSES_ON_CART: graphql(`
    mutation SetShippingAddressesOnCart(
      $cartId: String!
      $shippingAddresses: [ShippingAddressInput]!
    ) {
      setShippingAddressesOnCart(
        input: { cart_id: $cartId, shipping_addresses: $shippingAddresses }
      ) {
        cart {
          available_payment_methods {
            code
            downtime_alert
            title
          }
          shipping_addresses {
            available_shipping_methods {
              amount {
                currency
                value
              }
              carrier_code
              carrier_title
              method_code
              method_title
            }
            city
            country {
              code
              label
            }
            firstname
            lastname
            postcode
            region {
              code
              label
            }
            selected_shipping_method {
              amount {
                currency
                value
              }
              carrier_code
              carrier_title
              method_code
              method_title
            }
            street
            telephone
          }
        }
      }
    }
  `),

  SET_SHIPPING_METHODS_ON_CART: graphql(`
    mutation SetShippingMethodsOnCart($input: SetShippingMethodsOnCartInput!) {
      setShippingMethodsOnCart(input: $input) {
        cart {
          shipping_addresses {
            selected_shipping_method {
              carrier_code
              method_code
              amount {
                currency
                value
              }
              base_amount {
                currency
                value
              }
              price_excl_tax {
                currency
                value
              }
              price_incl_tax {
                currency
                value
              }
            }
          }
          prices {
            applied_taxes {
              label
              amount {
                currency
                value
              }
            }
            discount {
              label
              amount {
                currency
                value
              }
            }
            discounts {
              applied_to
              label
              amount {
                currency
                value
              }
            }
            grand_total {
              currency
              value
            }
            subtotal_excluding_tax {
              currency
              value
            }
            subtotal_including_tax {
              currency
              value
            }
            subtotal_with_discount_excluding_tax {
              currency
              value
            }
          }
          total_quantity
          selected_payment_method {
            code
            purchase_order_number
            title
          }
        }
      }
    }
  `),

  UPDATE_CART_ITEMS: graphql(`
    mutation UpdateCartItems(
      $input: UpdateCartItemsInput
      $page: Int!
      $pageSize: Int!
      $sort: QuoteItemsSortInput
    ) {
      updateCartItems(input: $input) {
        cart {
          ...CartDetailsFields
        }
      }
    }
  `),

  VALIDATE_BIN: graphql(`
    query ValidateBin($binNumber: String!, $cartId: String!) {
      validateBin(bin_number: $binNumber, cart_id: $cartId) {
        valid
        message
        bin
        bank_code
        country
        cart_id
      }
    }
  `),
};
