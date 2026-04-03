import { CategoryInterface } from "@/graphql/graphql";

/**
 * Category API response types
 */
export interface CategoriesResponse {
  categories: {
    items: Category[];
  };
}

/**
 * Base category type extending GraphQL CategoryInterface
 */
export interface Category extends CategoryInterface {
  category_tab?: number;
  celebrity_banner?: string;
  children?: Category[];
  children_count?: string;
  include_in_menu: number;
  level: number;
  name: string;
  uid: string;
  url_key: string;
  url_path: string;
}

/**
 * Category breadcrumb item
 */
export interface CategoryBreadcrumb {
  category_level: number;
  category_name: string;
  category_uid: string;
  category_url_key: string;
  category_url_path: string;
}

/**
 * Category cache key types
 */
export type CategoryCacheKey =
  | ["categories", "by-uid", string]
  | ["categories", "by-url-key", string]
  | ["categories", "hierarchy", CategoryQueryOptions]
  | ["categories", "products", CategoryProductsOptions]
  | ["categories", "url-keys"];

/**
 * Category context state
 */
export interface CategoryContextState {
  categories: Category[];
  currentCategory?: CategoryWithBreadcrumbs;
  error?: CategoryError;
  loadingState: CategoryLoadingState;
  selectedCategoryUid?: string;
}

/**
 * Category error types
 */
export interface CategoryError {
  categoryUid?: string;
  code?: string;
  message: string;
  urlKey?: string;
}

/**
 * Category filter input for GraphQL queries
 */
export interface CategoryFilters {
  category_uid?: {
    eq: string;
  };
  include_in_menu?: {
    eq: number;
  };
  level?: {
    eq: number;
  };
  parent_category_uid?: {
    eq: string;
  };
  url_key?: {
    eq: string;
  };
}

/**
 * Category hierarchy for navigation
 */
export interface CategoryHierarchy {
  allCategories: Map<string, Category>;
  categoryPaths: Map<string, string[]>;
  rootCategories: Category[];
}

/**
 * Category loading states
 */
export type CategoryLoadingState = "error" | "idle" | "loading" | "success";

/**
 * Category navigation item for UI components
 */
export interface CategoryNavigationItem {
  children?: CategoryNavigationItem[];
  hasChildren: boolean;
  isActive?: boolean;
  level: number;
  name: string;
  uid: string;
  url_key: string;
  url_path: string;
}

/**
 * Category page data for static generation
 */
export interface CategoryPageData {
  category: CategoryWithBreadcrumbs;
  products?: {
    items: any[];
    page_info: {
      current_page: number;
      page_size: number;
      total_pages: number;
    };
    total_count: number;
  };
}

/**
 * Category products query options
 */
export interface CategoryProductsOptions {
  categoryUid: string;
  currentPage?: number;
  pageSize?: number;
  sort?: {
    created_at?: "ASC" | "DESC";
    name?: "ASC" | "DESC";
    price?: "ASC" | "DESC";
  };
}

/**
 * Category query options for hooks
 */
export interface CategoryQueryOptions {
  filters?: CategoryFilters;
  includeInMenu?: boolean;
  level?: number;
  parentUid?: string;
}

export interface CategoryResponse {
  categories: {
    items: CategoryWithBreadcrumbs[];
  };
}

/**
 * Category URL key for static generation
 */
export interface CategoryUrlKey {
  level: number;
  url_key: string;
}

export interface CategoryUrlKeysResponse {
  categories: {
    items: CategoryUrlKey[];
  };
}

/**
 * Category with breadcrumbs for navigation
 */
export interface CategoryWithBreadcrumbs extends Category {
  breadcrumbs?: CategoryBreadcrumb[];
}
