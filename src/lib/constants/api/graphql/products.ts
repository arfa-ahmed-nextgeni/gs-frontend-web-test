import { graphql } from "@/graphql";

export const PRODUCTS_GRAPHQL_QUERIES = {
  GET_CATEGORIES: graphql(`
    query GetCategories {
      categories {
        items {
          id
          uid
          name
          url_key
          url_path
          level
          include_in_menu
          children_count
          meta_title
          meta_description
          meta_keywords
          children {
            id
            uid
            name
            url_key
            url_path
            level
            children_count
            include_in_menu
            meta_title
            meta_description
            meta_keywords
            children {
              id
              uid
              name
              url_key
              url_path
              level
              children_count
              include_in_menu
              meta_title
              meta_description
              meta_keywords
              children {
                id
                uid
                name
                url_key
                url_path
                level
                children_count
                include_in_menu
                meta_title
                meta_description
                meta_keywords
                children {
                  id
                  uid
                  name
                  url_key
                  url_path
                  level
                  children_count
                  include_in_menu
                  meta_title
                  meta_description
                  meta_keywords
                }
              }
            }
          }
        }
      }
    }
  `),

  GET_CATEGORY_PRODUCTS: graphql(`
    query GetCategoryProducts {
      products(filter: {}, pageSize: 10, currentPage: 1) {
        total_count
        items {
          id
          __typename
          sku
          name
          url_key
          stock_status
          small_image {
            url
            label
          }
          price_range {
            minimum_price {
              regular_price {
                value
                currency
              }
            }
            maximum_price {
              regular_price {
                value
                currency
              }
            }
          }

          ... on ConfigurableProduct {
            configurable_options {
              attribute_code
              label
              values {
                value_index
                label
              }
            }
            variants {
              product {
                id
                sku
                name
                stock_status
                price_range {
                  minimum_price {
                    regular_price {
                      value
                      currency
                    }
                  }
                }
                small_image {
                  url
                  label
                }
              }
              attributes {
                code
                value_index
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
  `),

  GET_PRODUCT_BASIC_INFO: graphql(`
    query GetProductBasicInfo($urlKey: String!) {
      products(filter: { url_key: { eq: $urlKey } }) {
        items {
          __typename
          uid
          id
          name
          sku
          brand_new
          short_description {
            html
          }
          thumbnail {
            url
          }
          rating_summary
          review_count
          price_range {
            minimum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
            }
          }
        }
      }
    }
  `),

  GET_PRODUCT_REVIEW_RATINGS_METADATA: graphql(`
    query GetProductReviewRatingsMetadata {
      productReviewRatingsMetadata {
        items {
          id
          name
          values {
            value_id
            value
          }
        }
      }
    }
  `),

  GET_PRODUCT_REVIEWS: graphql(`
    query GetProductReviews(
      $page: Int!
      $pageSize: Int!
      $productId: Int!
      $sort: ProductReviewSortInput
    ) {
      productReviews(
        product_id: $productId
        currentPage: $page
        pageSize: $pageSize
        sort: $sort
      ) {
        avg_rating
        total_count
        items {
          created_at
          detail
          nickname
          rating
          review_id
          title
        }
      }
    }
  `),

  GET_PRODUCTS: graphql(`
    query GetProducts(
      $search: String
      $filter: ProductAttributeFilterInput
      $pageSize: Int
      $currentPage: Int
      $sort: ProductAttributeSortInput
    ) {
      products(
        search: $search
        filter: $filter
        pageSize: $pageSize
        currentPage: $currentPage
        sort: $sort
      ) {
        items {
          id
          name
          sku
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
            }
          }
          image {
            url
            label
          }
          short_description {
            html
          }
          url_key
          stock_status
        }
        total_count
        page_info {
          page_size
          current_page
          total_pages
        }
      }
    }
  `),

  GET_PRODUCTS_BY_CATEGORY: graphql(`
    query GetProductsByCategory(
      $categoryUid: String!
      $pageSize: Int!
      $currentPage: Int!
    ) {
      products(
        filter: { category_uid: { eq: $categoryUid } }
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        total_count
        items {
          uid
          __typename
          name
          short_description {
            html
          }
          description {
            html
          }
          rating_summary
          sku
          url_key
          stock_status
          image {
            url
            label
          }
          small_image {
            url
            label
          }
          thumbnail {
            url
            label
          }
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
        page_info {
          current_page
          page_size
          total_pages
        }
      }
    }
  `),

  GET_VIEWED_PRODUCTS: graphql(`
    query GetViewedProducts($input: GetViewedProductInput!) {
      getViewedProducts(input: $input) {
        message
        product_skus
        status_code
      }
    }
  `),

  SEARCH_PRODUCTS: graphql(`
    query searchProducts(
      $search: String!
      $pageSize: Int!
      $currentPage: Int!
    ) {
      products(
        search: $search
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        total_count
        items {
          id
          name
          sku
          price {
            regularPrice {
              amount {
                value
                currency
              }
            }
          }
          small_image {
            url
          }

          ... on ConfigurableProduct {
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
        page_info {
          current_page
          page_size
          total_pages
        }
      }
    }
  `),
} as const;

export const PRODUCTS_GRAPHQL_MUTATIONS = {
  ADD_PRODUCT_REVIEW: graphql(`
    mutation CreateProductReview($input: CreateProductReviewInput!) {
      createProductReview(input: $input) {
        review {
          average_rating
          created_at
          nickname
          summary
          text
        }
      }
    }
  `),

  SAVE_VIEWED_PRODUCT: graphql(`
    mutation SaveViewedProduct($input: SaveViewedProductInput!) {
      saveViewedProduct(input: $input) {
        message
        status_code
      }
    }
  `),

  SUBSCRIBE_STOCK_NOTIFICATION: graphql(`
    mutation SubscribeStockNotification(
      $input: SubscribeStockNotificationInput!
    ) {
      subscribeStockNotification(input: $input) {
        message
        status_code
      }
    }
  `),

  VOTE_PRODUCT_REVIEW: graphql(`
    mutation VoteProductReview($reviewId: Int!, $isHelpful: Boolean!) {
      voteReviewHelpful(review_id: $reviewId, is_helpful: $isHelpful) {
        helpful_count
        message
        not_helpful_count
        review_id
      }
    }
  `),
} as const;
