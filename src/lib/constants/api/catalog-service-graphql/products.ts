import { graphql } from "@/catalog-service-graphql";

/**
 * Attribute set read by ProductDetailsModel on the PDP (37 attributes).
 * Single source of truth — update this list before reading a new attribute
 * on the product detail page, then re-run codegen.
 */
export const PdpAttributesFragment = graphql(`
  fragment PdpAttributes on ProductView {
    attributes(
      names: [
        "associated_products"
        "attribute_set"
        "product_type"
        "product_type_new2"
        "exclusive"
        "is_new"
        "product_tags"
        "review_rating"
        "value_off"
        "express_delivery_available"
        "low_stock_qty"
        "countdown_timer_enabled"
        "countdown_timer_start_date"
        "countdown_timer_end_date"
        "countdown_timer_title"
        "brand_new"
        "color"
        "gender"
        "character"
        "fragrance_notes"
        "top_notes"
        "middle_notes"
        "base_notes"
        "concentration"
        "year_of_launch"
        "size_new"
        "categories"
        "ingredients"
        "makeup_color"
        "area_of_apply"
        "texture"
        "product_color"
        "item_category"
        "skin_type"
        "finish"
        "coverage"
        "parent_product_url"
        "available_stock"
      ]
    ) {
      label
      name
      roles
      value
    }
  }
`);

/**
 * Attribute set for product cards / listings (19 attributes). This is the
 * union of every card-type consumer:
 *  - transformProductViewToCardModel (PLP, search, category)
 *  - CategoryProductsModel
 *  - LinkProducts (similar / you-might-also-like)
 *  - ViewedProducts + determineProductType (by-skus)  -> needs attribute_set
 *  - extractProductPrice                              -> needs giftcard_amount_values
 *  - gift-wrap drawer                                 -> needs product_meta_type
 * Some attributes are unused by a given query; the over-fetch is harmless and
 * keeps a single shared list. Update before reading a new card attribute.
 */
export const CardAttributesFragment = graphql(`
  fragment CardAttributes on ProductView {
    attributes(
      names: [
        "associated_products"
        "brand"
        "brand_new"
        "product_type"
        "product_type_new2"
        "exclusive"
        "is_new"
        "product_tags"
        "review_rating"
        "value_off"
        "express_delivery_available"
        "countdown_timer_enabled"
        "countdown_timer_start_date"
        "countdown_timer_end_date"
        "countdown_timer_title"
        "product_meta_type"
        "giftcard_amount_values"
        "attribute_set"
        "available_stock"
      ]
    ) {
      label
      name
      roles
      value
    }
  }
`);

export const CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES = {
  GET_PRODUCT_DETAILS_BY_SKU: graphql(`
    query GetProductDetailsBySku($sku: String!) {
      productSearch(filter: [{ attribute: "sku", eq: $sku }], phrase: "") {
        items {
          productView {
            __typename
            externalId
            name
            description
            sku
            urlKey
            metaDescription
            metaKeyword
            metaTitle
            videos {
              preview {
                url
              }
              url
            }
            images {
              url
            }
            ... on ComplexProductView {
              options {
                id
                multi
                required
                title
                values {
                  __typename
                  id
                  title
                  inStock
                  ... on ProductViewOptionValueSwatch {
                    title
                    type
                    value
                  }
                  ... on ProductViewOptionValueProduct {
                    product {
                      id
                    }
                  }
                }
              }
            }
            ... on SimpleProductView {
              name
              sku
              inStock
              price {
                regular {
                  amount {
                    currency
                    value
                  }
                }
                final {
                  amount {
                    currency
                    value
                  }
                }
              }
            }
            ...PdpAttributes
          }
          product {
            price_range {
              minimum_price {
                final_price {
                  currency
                }
              }
            }
          }
        }
      }
    }
  `),

  GET_PRODUCT_DETAILS_BY_URL_KEY: graphql(`
    query GetProductDetailsByUrlKey($urlKey: String!) {
      productSearch(
        filter: [{ attribute: "url_key", eq: $urlKey }]
        phrase: ""
      ) {
        items {
          productView {
            __typename
            externalId
            name
            description
            sku
            urlKey
            metaDescription
            metaKeyword
            metaTitle
            videos {
              preview {
                url
              }
              url
            }
            images {
              url
            }
            ... on ComplexProductView {
              options {
                id
                multi
                required
                title
                values {
                  __typename
                  id
                  title
                  inStock
                  ... on ProductViewOptionValueSwatch {
                    title
                    type
                    value
                  }
                  ... on ProductViewOptionValueProduct {
                    product {
                      id
                    }
                  }
                }
              }
            }
            ... on SimpleProductView {
              name
              sku
              inStock
              price {
                regular {
                  amount {
                    currency
                    value
                  }
                }
                final {
                  amount {
                    currency
                    value
                  }
                }
              }
            }
            ...PdpAttributes
          }
          product {
            price_range {
              minimum_price {
                final_price {
                  currency
                  value
                }
              }
            }
          }
        }
      }
    }
  `),

  GET_PRODUCTS_BY_SKUS: graphql(`
    query GetProductsBySkus($skus: [String!]!) {
      products(skus: $skus) {
        __typename
        id
        externalId
        name
        shortDescription
        sku
        inStock
        urlKey
        images {
          url
        }
        ...CardAttributes
        ... on SimpleProductView {
          price {
            final {
              amount {
                currency
                value
              }
            }
            regular {
              amount {
                currency
                value
              }
            }
          }
        }
        ... on ComplexProductView {
          options {
            id
            values {
              __typename
              id
              title
              inStock
              ... on ProductViewOptionValueSwatch {
                type
                value
              }
            }
          }
          priceRange {
            minimum {
              final {
                amount {
                  currency
                  value
                }
              }
              regular {
                amount {
                  currency
                  value
                }
              }
            }
          }
        }
      }
    }
  `),

  GET_SIMILAR_PRODUCTS: graphql(`
    query GetSimilarProducts(
      $brand: String!
      $typeFilter: SearchClauseInput!
      $gender: String!
    ) {
      productSearch(
        filter: [
          { attribute: "brand_new", eq: $brand }
          $typeFilter
          { attribute: "gender", eq: $gender }
        ]
        sort: [{ attribute: "inStock", direction: DESC }]
        phrase: ""
        page_size: 10
      ) {
        total_count
        items {
          productView {
            __typename
            id
            externalId
            name
            shortDescription
            sku
            inStock
            urlKey
            images {
              url
            }
            ...CardAttributes
            ... on SimpleProductView {
              price {
                final {
                  amount {
                    currency
                    value
                  }
                }
                regular {
                  amount {
                    currency
                    value
                  }
                }
              }
            }
            ... on ComplexProductView {
              options {
                id
                values {
                  __typename
                  id
                  title
                  inStock
                  ... on ProductViewOptionValueSwatch {
                    type
                    value
                  }
                }
              }
              priceRange {
                minimum {
                  final {
                    amount {
                      currency
                      value
                    }
                  }
                  regular {
                    amount {
                      currency
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `),

  GET_YOU_MIGHT_ALSO_LIKE_PRODUCTS: graphql(`
    query GetYouMightAlsoLikeProducts(
      $typeFilter: SearchClauseInput!
      $gender: String!
    ) {
      productSearch(
        filter: [
          { attribute: "categoryPath", eq: "you-might-also-like" }
          $typeFilter
          { attribute: "gender", eq: $gender }
          { attribute: "inStock", eq: "true" }
        ]
        sort: [
          { attribute: "position", direction: ASC }
          { attribute: "inStock", direction: DESC }
        ]
        phrase: ""
        page_size: 10
      ) {
        total_count
        items {
          productView {
            __typename
            id
            externalId
            name
            shortDescription
            sku
            inStock
            urlKey
            images {
              url
            }
            ...CardAttributes
            ... on SimpleProductView {
              price {
                final {
                  amount {
                    currency
                    value
                  }
                }
                regular {
                  amount {
                    currency
                    value
                  }
                }
              }
            }
            ... on ComplexProductView {
              options {
                id
                values {
                  __typename
                  id
                  title
                  inStock
                  ... on ProductViewOptionValueSwatch {
                    type
                    value
                  }
                }
              }
              priceRange {
                minimum {
                  final {
                    amount {
                      currency
                      value
                    }
                  }
                  regular {
                    amount {
                      currency
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `),

  PRODUCT_SEARCH: graphql(`
    query ProductSearch(
      $phrase: String!
      $filter: [SearchClauseInput!]
      $sort: [ProductSearchSortInput!]
      $currentPage: Int
      $pageSize: Int
    ) {
      productSearch(
        phrase: $phrase
        filter: $filter
        sort: $sort
        current_page: $currentPage
        page_size: $pageSize
      ) {
        facets {
          attribute
          title
          type
          buckets {
            title
            ... on ScalarBucket {
              id
              count
            }
            ... on RangeBucket {
              from
              to
              count
            }
            ... on CategoryView {
              id
              name
              path
              count
            }
          }
        }
        items {
          productView {
            __typename
            id
            externalId
            sku
            name
            shortDescription
            description
            inStock
            lowStock
            urlKey
            images {
              url
              label
              roles
            }
            ...CardAttributes
            ... on SimpleProductView {
              price {
                final {
                  amount {
                    currency
                    value
                  }
                }
                regular {
                  amount {
                    currency
                    value
                  }
                }
              }
            }
            ... on ComplexProductView {
              priceRange {
                minimum {
                  final {
                    amount {
                      currency
                      value
                    }
                  }
                  regular {
                    amount {
                      currency
                      value
                    }
                  }
                }
                maximum {
                  final {
                    amount {
                      currency
                      value
                    }
                  }
                  regular {
                    amount {
                      currency
                      value
                    }
                  }
                }
              }
              options {
                id
                title
                required
                multi
                values {
                  __typename
                  id
                  title
                  inStock
                  ... on ProductViewOptionValueSwatch {
                    type
                    value
                  }
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
        total_count
        suggestions
        related_terms
      }
    }
  `),
} as const;
