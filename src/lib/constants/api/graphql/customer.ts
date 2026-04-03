import { graphql } from "@/graphql";

graphql(`
  fragment WishlistDetailsFields on Wishlist {
    id
    name
    items_count
    items_v2(currentPage: $page, pageSize: $pageSize) {
      items {
        __typename
        id

        ... on ConfigurableWishlistItem {
          configurable_options {
            value_label
            configurable_product_option_uid
            configurable_product_option_value_uid
          }
          configured_variant {
            id
            stock_status
            express_delivery_available
            sku
          }
        }

        product {
          __typename
          uid
          id
          name
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
          price_range {
            minimum_price {
              regular_price {
                value
                currency
              }
              final_price {
                value
                currency
              }
              discount {
                amount_off
                percent_off
              }
            }
            maximum_price {
              regular_price {
                value
                currency
              }
              final_price {
                value
                currency
              }
              discount {
                amount_off
                percent_off
              }
            }
          }

          ... on ConfigurableProduct {
            variants {
              product {
                id
              }
            }
            configurable_options {
              attribute_code
              label
              values {
                uid
                label
              }
            }
          }
        }
      }
      page_info {
        current_page
        page_size
        total_pages
      }
    }
  }
`);

export const CUSTOMER_GRAPHQL_QUERIES = {
  GET_CUSTOMER: graphql(`
    query GetCustomer {
      customer {
        id
        firstname
        lastname
        email
        gender
        date_of_birth
        reward_points {
          balance {
            money {
              currency
              value
            }
            points
          }
        }
        custom_attributes {
          code
          ... on AttributeValue {
            value
          }
          ... on AttributeSelectedOptions {
            selected_options {
              label
              value
            }
          }
        }
      }
    }
  `),

  GET_CUSTOMER_ADDRESSES: graphql(`
    query GetCustomerAddresses {
      customer {
        firstname
        lastname
        email
        default_billing
        default_shipping
        addresses {
          id
          address_label
          city
          city_code
          country_code
          firstname
          is_ksa_verified
          ksa_short_address
          lastname
          latitude
          longitude
          middlename
          prefix
          postcode
          street
          telephone
          region {
            region
            region_code
            region_id
          }
        }
        custom_attributes {
          code
          ... on AttributeValue {
            value
          }
          ... on AttributeSelectedOptions {
            selected_options {
              label
              value
            }
          }
        }
      }
    }
  `),

  GET_CUSTOMER_ORDERS: graphql(`
    query GetCustomerOrdersList(
      $pageSize: Int
      $currentPage: Int
      $filter: CustomerOrdersFilterInput
      $sort: CustomerOrderSortInput
    ) {
      customer {
        orders(
          pageSize: $pageSize
          currentPage: $currentPage
          filter: $filter
          sort: $sort
          scope: WEBSITE
        ) {
          items {
            id
            increment_id
            user_actions {
              action
              label
            }
            number
            order_date
            order_invoice_url
            status
            grand_total
            items {
              id
              product_name
              product_sku
              quantity_ordered
              product_sale_price {
                currency
                value
              }
              product {
                id
                sku
                image {
                  url
                }
                type_id
              }
            }
            payment_methods {
              name
              type
              additional_data {
                name
                value
              }
            }
            billing_address {
              city
              company
              country_code
              fax
              firstname
              lastname
              middlename
              postcode
              prefix
              region
              region_id
              street
              suffix
              telephone
              vat_id
            }
            shipping_address {
              city
              company
              country_code
              fax
              firstname
              lastname
              middlename
              postcode
              prefix
              region
              region_id
              street
              suffix
              telephone
              vat_id
            }
            shipping_method
            total {
              discounts {
                label
                amount {
                  currency
                  value
                }
              }
              cod_fee {
                currency
                value
              }
              total_tax {
                currency
                value
              }
              grand_total {
                currency
                value
              }
              shipping_handling {
                taxes {
                  amount {
                    currency
                    value
                  }
                }
                total_amount {
                  currency
                  value
                }
                amount_including_tax {
                  currency
                  value
                }
              }
              subtotal {
                currency
                value
              }
              mokafaa_discount {
                currency
                value
              }
            }
            tracking_status
            shipments {
              tracking {
                carrier
                number
                title
              }
              number
              id
              items {
                id
                product_name
                product_sku
                quantity_shipped
              }
            }
          }
          total_count
        }
      }
    }
  `),

  GET_CUSTOMER_REWARD_POINTS_BALANCE: graphql(`
    query GetCustomerRewardPointsBalance {
      customer {
        reward_points {
          balance {
            points
            money {
              currency
              value
            }
          }
        }
      }
    }
  `),

  GET_CUSTOMER_REWARD_POINTS_HISTORY: graphql(`
    query GetCustomerRewardPointsHistory {
      customer {
        reward_points {
          balance_history {
            balance {
              points
              money {
                value
                currency
              }
            }
            points_change
            change_reason
            comment
            date
            expiry_date
            name
            order_id
          }
          balance {
            points
            money {
              currency
              value
            }
          }
        }
      }
    }
  `),

  GET_CUSTOMER_WISHLIST: graphql(`
    query GetCustomerWishlist($page: Int!, $pageSize: Int!) {
      customer {
        wishlists {
          ...WishlistDetailsFields
        }
      }
    }
  `),

  GET_KSA_ADDRESS: graphql(`
    query GetKsaAddress(
      $language: String!
      $longitude: String!
      $latitude: String!
    ) {
      getKsaAddress(
        language: $language
        longitude: $longitude
        latitude: $latitude
      ) {
        success
        NationalAddress {
          additionalNumber
          address1
          address2
          buildingNumber
          city
          cityId
          district
          language
          latitude
          longitude
          postCode
          region
          short_address
          street
        }
        Message {
          MessageCode
          MessageDescriptionAr
          MessageDescriptionEn
        }
      }
    }
  `),
} as const;

export const CUSTOMER_GRAPHQL_MUTATIONS = {
  ADD_PRODUCTS_TO_WISHLIST: graphql(`
    mutation AddProductsToWishlist(
      $wishlistId: ID!
      $wishlistItems: [WishlistItemInput!]!
      $page: Int!
      $pageSize: Int!
    ) {
      addProductsToWishlist(
        wishlistId: $wishlistId
        wishlistItems: $wishlistItems
      ) {
        user_errors {
          code
          message
        }
        wishlist {
          ...WishlistDetailsFields
        }
      }
    }
  `),

  ADD_WISHLIST_ITEMS_TO_CART: graphql(`
    mutation AddWishlistItemsToCart(
      $wishlistId: ID!
      $wishlistItemIds: [ID!]
      $page: Int!
      $pageSize: Int!
    ) {
      addWishlistItemsToCart(
        wishlistId: $wishlistId
        wishlistItemIds: $wishlistItemIds
      ) {
        add_wishlist_items_to_cart_user_errors {
          code
          message
          wishlistId
          wishlistItemId
        }
        status
        wishlist {
          ...WishlistDetailsFields
        }
      }
    }
  `),

  CANCEL_CUSTOMER_ORDER: graphql(`
    mutation CancelCustomerOrder($order_id: String!) {
      cancelCustomerOrder(order_id: $order_id) {
        success
        message
        customerOrderDetail {
          increment_id
          grand_total
          status
        }
        order {
          items {
            product_name
            product_sku
            quantity_ordered
          }
          user_actions {
            action
            label
          }
          order_invoice_url
        }
      }
    }
  `),

  CREATE_CUSTOMER_ADDRESS: graphql(`
    mutation CreateCustomerAddress($input: CustomerAddressInput!) {
      createCustomerAddress(input: $input) {
        id
        firstname
        lastname
        city
        country_code
        ksa_short_address
        latitude
        longitude
        region {
          region
        }
        postcode
        telephone
        default_shipping
        default_billing
      }
    }
  `),

  DELETE_CUSTOMER_ADDRESS: graphql(`
    mutation DeleteCustomerAddress($id: Int!) {
      deleteCustomerAddress(id: $id)
    }
  `),

  REMOVE_PRODUCTS_FROM_WISHLIST: graphql(`
    mutation RemoveProductsFromWishlist(
      $wishlistId: ID!
      $wishlistItemsIds: [ID!]!
      $page: Int!
      $pageSize: Int!
    ) {
      removeProductsFromWishlist(
        wishlistId: $wishlistId
        wishlistItemsIds: $wishlistItemsIds
      ) {
        user_errors {
          code
          message
        }
        wishlist {
          ...WishlistDetailsFields
        }
      }
    }
  `),

  REORDER_CUSTOMER_ORDER: graphql(`
    mutation ReorderCustomerOrder($increment_id: String!, $reorder: Boolean!) {
      gsRefillCart(increment_id: $increment_id, reorder: $reorder) {
        success
        message
        reorder
        cart_id
      }
    }
  `),

  UPDATE_CUSTOMER: graphql(`
    mutation UpdateCustomer($input: CustomerInput!) {
      updateCustomer(input: $input) {
        customer {
          firstname
          lastname
          email
          date_of_birth
        }
      }
    }
  `),

  UPDATE_CUSTOMER_ADDRESS: graphql(`
    mutation UpdateCustomerAddress($id: Int!, $input: CustomerAddressInput!) {
      updateCustomerAddress(id: $id, input: $input) {
        id
        firstname
        lastname
        street
        city
        region {
          region
          region_code
          region_id
        }
        postcode
        country_code
        telephone
        default_shipping
        default_billing
        ksa_short_address
        latitude
        longitude
      }
    }
  `),
} as const;
