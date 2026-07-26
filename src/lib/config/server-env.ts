import "server-only";

export const GRAPHQL_BASE_URL = process.env.GRAPHQL_BASE_URL!;
export const REST_BASE_URL = process.env.REST_BASE_URL!;
export const CHECKOUT_BASE_URL = process.env.CHECKOUT_BASE_URL!;
// Checkout.com publishable/public key — safe to forward to the client
// (unlike the other secrets in this file). Threaded to CheckoutLayoutClient
// as a prop for Frames.js initialization.
export const CHECKOUT_PUBLIC_API_KEY = process.env.CHECKOUT_PUBLIC_API_KEY!;
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
export const WEBSITE_ID_SURRATI = process.env.WEBSITE_ID_SURRATI
  ? Number(process.env.WEBSITE_ID_SURRATI)
  : undefined;
export const WEBSITE_ID_FABIAN = process.env.WEBSITE_ID_FABIAN
  ? Number(process.env.WEBSITE_ID_FABIAN)
  : undefined;
export const CATEGORY_SHELL_CACHE_DISABLED =
  process.env.CATEGORY_SHELL_CACHE_DISABLED === "true";
export const PRODUCT_DETAILS_CACHE_DISABLED =
  process.env.PRODUCT_DETAILS_CACHE_DISABLED === "true";
export const STOREFRONT_API_ALLOW_INSECURE_TLS =
  process.env.STOREFRONT_API_ALLOW_INSECURE_TLS === "true";
export const API_ACTIVITY_ENABLED = process.env.API_ACTIVITY_ENABLED;
export const API_ACTIVITY_PASSWORD = process.env.API_ACTIVITY_PASSWORD;
export const API_ACTIVITY_RETENTION_HOURS =
  process.env.API_ACTIVITY_RETENTION_HOURS;
export const API_ACTIVITY_MAX_ENTRIES = process.env.API_ACTIVITY_MAX_ENTRIES;
export const API_ACTIVITY_MAX_BODY_BYTES =
  process.env.API_ACTIVITY_MAX_BODY_BYTES;
export const API_ACTIVITY_REDACTION_ENABLED =
  process.env.API_ACTIVITY_REDACTION_ENABLED;
export const NEXT_PHASE = process.env.NEXT_PHASE;
