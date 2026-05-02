export const ApiActivityFeatures = {
  Auth: "auth",
  Catalog: "catalog",
  Checkout: "checkout",
  Content: "content",
  Operations: "operations",
  Payments: "payments",
  Seo: "seo",
  Storefront: "storefront",
} as const;

export type ApiActivityFeature =
  (typeof ApiActivityFeatures)[keyof typeof ApiActivityFeatures];

export const ApiActivityServices = {
  Catalog: "catalog",
  Checkout: "checkout",
  Contentful: "contentful",
  Fetch: "fetch",
  Graphql: "graphql",
  Operations: "operations",
  Payfort: "payfort",
  Payments: "payments",
  Rest: "rest",
  Sitemap: "sitemap",
} as const;

export type ApiActivityService =
  (typeof ApiActivityServices)[keyof typeof ApiActivityServices];
