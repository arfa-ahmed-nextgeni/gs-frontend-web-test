export enum CacheTags {
  Brands = "brands",
  Catalog = "catalog",
  CategoryProducts = "category-products",
  CategoryRouteShell = "category-route-shell",
  Contentful = "contentful",
  Magento = "magento",
  ProductDetails = "product-details",
  RecentlyViewedProducts = "recently-viewed-products",
  StoreConfig = "store-config",
}

export const getRecentlyViewedProductsTagByDeviceId = (deviceId: string) =>
  `${CacheTags.RecentlyViewedProducts}:device:${deviceId}`;

export const getRecentlyViewedProductsTagByMobileNumber = (
  mobileNumber: string
) => `${CacheTags.RecentlyViewedProducts}:mobile:${mobileNumber}`;
