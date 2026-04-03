export const API_CONSTANTS = {
  CACHE_TTL: 300,
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_TIMEOUT: 50000,
  MAX_PAGE_SIZE: 100,
  RETRY_ATTEMPTS: 3,
} as const;

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  CREATED: 201,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  OK: 200,
  UNAUTHORIZED: 401,
} as const;

export const HEADERS = {
  ACCEPT: "Accept",
  API_SECRET: "x-api-secret",
  AUTHORIZATION: "Authorization",
  CONTENT_TYPE: "Content-Type",
  HOST: "host",
  MAGENTO_ENVIRONMENT_ID: "Magento-Environment-Id",
  MAGENTO_STORE_CODE: "Magento-Store-Code",
  MAGENTO_STORE_VIEW_CODE: "Magento-Store-View-Code",
  MAGENTO_WEBSITE_CODE: "Magento-Website-Code",
  STORE: "store",
  USER_AGENT: "User-Agent",
  X_API_KEY: "X-API-Key",
  X_FORWARDED_FOR: "X-Forwarded-For",
  X_FORWARDED_PROTO: "X-Forwarded-Proto",
  X_PLATFORM: "X-platform",
  X_REAL_IP: "X-Real-IP",
  X_WEBHOOK_SECRET: "X-Webhook-Secret",
} as const;
