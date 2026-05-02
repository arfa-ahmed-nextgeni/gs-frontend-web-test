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
            api_catnav_image
            api_catnav_icon
            api_celebrity_thumbnail
            celebrity_banner
            children {
              include_in_menu
            }
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
} as const;
