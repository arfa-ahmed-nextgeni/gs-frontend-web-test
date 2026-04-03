import { graphql } from "@/graphql";

export const CATEGORIES_GRAPHQL_QUERIES = {
  GET_BRANDS: graphql(`
    query GetBrands {
      categories(filters: { url_key: { eq: "brands" } }) {
        items {
          uid
          name
          url_key
          url_path
          children_count
          children {
            uid
            name
            url_key
            url_path
            image
            children {
              include_in_menu
            }
          }
        }
      }
    }
  `),

  /**
   * Get all categories with full hierarchy and additional fields
   * Comprehensive query for navigation and category management
   */
  GET_CATEGORIES_DETAILED: graphql(`
    query GetCategoriesDetailed {
      categories(filters: {}) {
        items {
          uid
          name
          url_key
          url_path
          level
          include_in_menu
          children_count
          children {
            uid
            name
            url_key
            url_path
            level
            children_count
            product_count
            include_in_menu
            category_tab
            celebrity_banner
            children {
              include_in_menu
              category_tab
              celebrity_banner
              name
              path
              children {
                include_in_menu
                category_tab
                celebrity_banner
                name
                path
                children {
                  breadcrumbs {
                    category_level
                    category_name
                    category_uid
                    category_url_key
                    category_url_path
                  }
                  product_count
                  include_in_menu
                  category_tab
                  celebrity_banner
                  name
                  path
                  uid
                  url_key
                  url_path
                }
                path_in_store
              }
            }
          }
          category_tab
          celebrity_banner
        }
      }
    }
  `),

  /**
   * Get category by UID with full hierarchy and additional fields
   * Includes product_count, category_tab, celebrity_banner, and breadcrumbs
   */
  GET_CATEGORY_BY_UID_DETAILED: graphql(`
    query GetCategoryByUidDetailed($categoryUid: String!) {
      categories(filters: { category_uid: { eq: $categoryUid } }) {
        items {
          uid
          name
          url_key
          url_path
          level
          include_in_menu
          children_count
          children {
            uid
            name
            url_key
            url_path
            level
            children_count
            product_count
            include_in_menu
            category_tab
            celebrity_banner
            children {
              include_in_menu
              category_tab
              celebrity_banner
              name
              path
              children {
                include_in_menu
                category_tab
                celebrity_banner
                name
                path
                children {
                  breadcrumbs {
                    category_level
                    category_name
                    category_uid
                    category_url_key
                    category_url_path
                  }
                  product_count
                  include_in_menu
                  category_tab
                  celebrity_banner
                  name
                  path
                  uid
                  url_key
                  url_path
                }
                path_in_store
              }
            }
          }
          category_tab
          celebrity_banner
        }
      }
    }
  `),

  /**
   * Get category by URL key (slug) with basic details first
   * Used when you have a slug but need the full category data
   */
  GET_CATEGORY_BY_URL_KEY_DETAILED: graphql(`
    query GetCategoryByUrlKeyDetailed($urlKey: String!) {
      categories(filters: { url_key: { eq: $urlKey } }) {
        items {
          uid
          name
          url_key
          url_path
          level
          include_in_menu
          children_count
          product_count
          category_tab
          celebrity_banner
          children {
            uid
            name
            url_key
            url_path
            level
            children_count
            product_count
            include_in_menu
            category_tab
            celebrity_banner
          }
        }
      }
    }
  `),

  /**
   * Get category route shell data by full URL path
   * Used by category route shell action
   */
  GET_CATEGORY_ROUTE_SHELL_BY_PATH: graphql(`
    query GetCategoryRouteShellByPath($urlPath: String!) {
      categories(filters: { url_path: { eq: $urlPath } }) {
        items {
          id
          uid
          name
          url_key
          url_path
          level
          include_in_menu
          children_count
          product_count
          meta_title
          meta_description
          meta_keywords
          breadcrumbs {
            category_level
            category_name
            category_url_path
          }
          children {
            id
            uid
            name
            url_key
            url_path
            product_count
          }
        }
      }
    }
  `),

  /**
   * Get products for a specific category by category UID
   * Used to fetch products within a category
   */
  GET_PRODUCTS_BY_CATEGORY_UID: graphql(`
    query GetProductsByCategoryUid(
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
          rating_summary
          review_count
          short_description {
            html
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

  // Note: Basic GET_CATEGORIES query exists in products.ts
  // Use PRODUCTS_GRAPHQL_QUERIES.GET_CATEGORIES for simple queries
  // Use PRODUCTS_GRAPHQL_QUERIES.GET_CATEGORY_PRODUCTS for products
} as const;
