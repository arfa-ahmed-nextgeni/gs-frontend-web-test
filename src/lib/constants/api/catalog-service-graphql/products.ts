import { graphql } from "@/catalog-service-graphql";

export const CATALOG_SERVICE_PRODUCTS_GRAPHQL_QUERIES = {
  GET_LINK_PRODUCTS: graphql(`
    query GetLinkProducts($sku: String!, $linkType: String!) {
      products(skus: [$sku]) {
        links(linkTypes: [$linkType]) {
          product {
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
            attributes {
              label
              name
              roles
              value
            }
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

  GET_PRODUCT_DETAILS: graphql(`
    query GetProductDetails($sku: String!) {
      products(skus: [$sku]) {
        __typename
        externalId
        name
        description
        sku
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
        attributes {
          label
          name
          roles
          value
        }
      }
    }
  `),

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
            attributes {
              label
              name
              roles
              value
            }
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
            attributes {
              label
              name
              roles
              value
            }
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

  GET_PRODUCT_VARIANTS: graphql(`
    query GetProductVariants($sku: String!) {
      variants(sku: $sku) {
        variants {
          selections
          product {
            __typename
            images(roles: []) {
              url
            }
            videos {
              preview {
                url
              }
              url
            }
            addToCartAllowed
            inStock
            lowStock
            id
            sku
            urlKey
            attributes {
              label
              name
              roles
              value
            }

            ... on SimpleProductView {
              price {
                roles
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
        attributes {
          label
          name
          roles
          value
        }
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
      $productType: String!
      $gender: String!
    ) {
      productSearch(
        filter: [
          { attribute: "brand_new", eq: $brand }
          { attribute: "product_type_new2", eq: $productType }
          { attribute: "gender", eq: $gender }
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
            attributes {
              label
              name
              roles
              value
            }
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
    query GetYouMightAlsoLikeProducts($productType: String!, $gender: String!) {
      productSearch(
        filter: [
          { attribute: "categoryPath", eq: "sale" }
          { attribute: "product_type_new2", eq: $productType }
          { attribute: "gender", eq: $gender }
          { attribute: "inStock", eq: "true" }
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
            attributes {
              label
              name
              roles
              value
            }
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
            attributes {
              name
              label
              value
              roles
            }
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
