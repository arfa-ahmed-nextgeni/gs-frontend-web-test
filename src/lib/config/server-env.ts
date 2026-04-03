import "server-only";

export const GRAPHQL_BASE_URL = process.env.GRAPHQL_BASE_URL!;
export const REST_BASE_URL = process.env.REST_BASE_URL!;
export const CHECKOUT_BASE_URL = process.env.CHECKOUT_BASE_URL!;
export const CHECKOUT_PUBLIC_API_KEY = process.env.CHECKOUT_PUBLIC_API_KEY!;
export const CONTENTFUL_BASE_URL = process.env.CONTENTFUL_BASE_URL!;
export const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
export const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN!;
export const CONTENTFUL_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT!;
export const OPERATIONS_API_SECRET = process.env.OPERATIONS_API_SECRET!;
export const OPERATIONS_BASE_URL = process.env.OPERATIONS_BASE_URL!;
export const OPERATIONS_FODEL_APPKEY = process.env.OPERATIONS_FODEL_APPKEY!;
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;
export const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN!;
export const CATALOG_SERVICE_BASE_URL = process.env.CATALOG_SERVICE_BASE_URL!;
export const CATALOG_SERVICE_X_API_KEY = process.env.CATALOG_SERVICE_X_API_KEY!;
export const CATALOG_SERVICE_ENVIRONMENT_ID =
  process.env.CATALOG_SERVICE_ENVIRONMENT_ID!;
export const PAYMENTS_SERVICE_BASE_URL = process.env.PAYMENTS_SERVICE_BASE_URL!;
export const PAYMENTS_API_KEY = process.env.PAYMENTS_API_KEY!;
export const USE_BUNDLED_STORE_CONFIG_FALLBACK =
  process.env.USE_BUNDLED_STORE_CONFIG_FALLBACK === "true";
