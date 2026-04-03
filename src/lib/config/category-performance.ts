/**
 * Category Performance Configuration
 * Optimized settings for high-performance category pages
 */

// Cache durations in milliseconds
export const CATEGORY_CACHE_DURATIONS = {
  CATEGORY_DETAILS: 5 * 60 * 1000, // 5 minutes
  // Server-side caching with ISR
  CATEGORY_HIERARCHY: 5 * 60 * 1000, // 5 minutes
  CATEGORY_PRODUCTS: 2 * 60 * 1000, // 2 minutes
  CATEGORY_URL_KEYS: 30 * 60 * 1000, // 30 minutes
  // Client-side caching with React Query
  CLIENT_CATEGORIES: 5 * 60 * 1000, // 5 minutes

  CLIENT_PRODUCTS: 2 * 60 * 1000, // 2 minutes
  NAVIGATION_CATEGORIES: 10 * 60 * 1000, // 10 minutes
} as const;

// ISR revalidation intervals in seconds
export const CATEGORY_ISR_CONFIG = {
  CATEGORY_NAVIGATION: 600, // 10 minutes
  CATEGORY_PAGES: 300, // 5 minutes
  CATEGORY_PRODUCTS: 120, // 2 minutes
} as const;

// GraphQL query optimization settings
export const CATEGORY_QUERY_OPTIMIZATION = {
  // Default page size for category products
  DEFAULT_PRODUCTS_PAGE_SIZE: 20,

  // Fields to include in category queries
  ESSENTIAL_CATEGORY_FIELDS: [
    "uid",
    "name",
    "url_key",
    "url_path",
    "level",
    "include_in_menu",
    "children_count",
    "description",
    "image",
    "meta_title",
    "meta_description",
    "canonical_url",
    "breadcrumbs",
  ],

  // Fields to include in product queries
  ESSENTIAL_PRODUCT_FIELDS: [
    "uid",
    "name",
    "sku",
    "url_key",
    "stock_status",
    "price_range",
    "image",
    "small_image",
    "thumbnail",
    "rating_summary",
    "short_description",
  ],

  // Maximum depth for category hierarchy
  MAX_CATEGORY_DEPTH: 4,

  // Maximum products to fetch in one request
  MAX_PRODUCTS_PER_REQUEST: 100,
} as const;

// Performance monitoring thresholds
export const CATEGORY_PERFORMANCE_THRESHOLDS = {
  // Maximum acceptable response time (ms)
  MAX_RESPONSE_TIME: 2000,

  // Maximum acceptable time to first byte (ms)
  MAX_TTFB: 500,

  // Maximum acceptable time to interactive (ms)
  MAX_TTI: 3000,

  // Cache hit ratio threshold
  MIN_CACHE_HIT_RATIO: 0.8,
} as const;

// Bundle optimization settings
export const CATEGORY_BUNDLE_OPTIMIZATION = {
  // Enable code splitting for category components
  ENABLE_CODE_SPLITTING: true,

  // Enable service worker caching
  ENABLE_SERVICE_WORKER: true,

  // Lazy load category components
  LAZY_LOAD_CATEGORIES: true,

  // Preload critical category data
  PRELOAD_CRITICAL_CATEGORIES: true,
} as const;

// SEO optimization settings
export const CATEGORY_SEO_OPTIMIZATION = {
  // Enable dynamic meta tags
  ENABLE_DYNAMIC_META: true,

  // Enable structured data
  ENABLE_STRUCTURED_DATA: true,

  // Generate sitemap for categories
  GENERATE_CATEGORY_SITEMAP: true,

  // Generate static pages for all categories
  GENERATE_STATIC_CATEGORIES: true,
} as const;

// Error handling and fallback settings
export const CATEGORY_ERROR_HANDLING = {
  // Show error boundaries for category components
  ENABLE_ERROR_BOUNDARIES: true,

  // Log performance metrics
  ENABLE_PERFORMANCE_LOGGING: true,

  // Fallback to cached data on error
  FALLBACK_TO_CACHE: true,

  // Retry failed requests
  MAX_RETRIES: 3,
} as const;

// Development and debugging settings
export const CATEGORY_DEBUG_CONFIG = {
  // Enable performance metrics
  ENABLE_PERFORMANCE_METRICS: true,

  // Enable React Query devtools
  ENABLE_REACT_QUERY_DEVTOOLS: process.env.NODE_ENV === "development",

  // Enable cache hit logging
  LOG_CACHE_HITS: process.env.NODE_ENV === "development",

  // Enable GraphQL query logging
  LOG_GRAPHQL_QUERIES: process.env.NODE_ENV === "development",
} as const;

/**
 * Performance monitoring utilities
 */
export class CategoryPerformanceMonitor {
  private static instance: CategoryPerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): CategoryPerformanceMonitor {
    if (!this.instance) {
      this.instance = new CategoryPerformanceMonitor();
    }
    return this.instance;
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  isPerformanceAcceptable(metricName: string, threshold?: number): boolean {
    const average = this.getAverageMetric(metricName);
    const limit =
      threshold || CATEGORY_PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME;
    return average <= limit;
  }

  logPerformanceReport(): void {
    if (!CATEGORY_DEBUG_CONFIG.ENABLE_PERFORMANCE_METRICS) return;

    console.info("Category Performance Report");
    this.metrics.forEach((values, name) => {
      const average = this.getAverageMetric(name);
      const max = Math.max(...values);
      const min = Math.min(...values);
      console.info(
        `${name}: avg=${average.toFixed(2)}ms, max=${max}ms, min=${min}ms`
      );
    });
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }
}

/**
 * Get cache key for category data
 */
export function getCategoryCacheKey(
  type: string,
  identifier: string,
  options?: any
): string {
  const baseKey = `category:${type}:${identifier}`;
  if (options) {
    const optionsKey = JSON.stringify(options);
    return `${baseKey}:${btoa(optionsKey)}`;
  }
  return baseKey;
}

/**
 * Get optimized query variables for category requests
 */
export function getOptimizedCategoryQueryVars(
  options: {
    currentPage?: number;
    maxDepth?: number;
    pageSize?: number;
  } = {}
) {
  return {
    currentPage: options.currentPage || 1,
    maxDepth: Math.min(
      options.maxDepth || CATEGORY_QUERY_OPTIMIZATION.MAX_CATEGORY_DEPTH,
      CATEGORY_QUERY_OPTIMIZATION.MAX_CATEGORY_DEPTH
    ),
    pageSize: Math.min(
      options.pageSize ||
        CATEGORY_QUERY_OPTIMIZATION.DEFAULT_PRODUCTS_PAGE_SIZE,
      CATEGORY_QUERY_OPTIMIZATION.MAX_PRODUCTS_PER_REQUEST
    ),
  };
}

/**
 * Check if category data should be revalidated
 */
export function shouldRevalidateCategory(
  lastUpdated: number,
  cacheDuration: number = CATEGORY_CACHE_DURATIONS.CATEGORY_DETAILS
): boolean {
  return Date.now() - lastUpdated > cacheDuration;
}
