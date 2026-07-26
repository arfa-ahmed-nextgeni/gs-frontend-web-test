import { TypedDocumentString } from "@/catalog-service-graphql/graphql";

export interface GetBrandCategoriesResult {
  categories?: Array<{
    id?: null | string;
    level?: null | number;
    name?: null | string;
    urlKey?: null | string;
    urlPath?: null | string;
  }> | null;
}

export interface GetBrandCategoriesVariables {
  depth: number;
  ids?: string[];
  startLevel: number;
}

export const CATALOG_SERVICE_CATEGORIES_GRAPHQL_QUERIES = {
  GET_BRAND_CATEGORIES: new TypedDocumentString<
    GetBrandCategoriesResult,
    GetBrandCategoriesVariables
  >(`
    query GetBrandCategories($ids: [String!], $depth: Int!, $startLevel: Int!) {
      categories(ids: $ids, subtree: { depth: $depth, startLevel: $startLevel }) {
        id
        name
        level
        urlKey
        urlPath
      }
    }
  `),
} as const;
