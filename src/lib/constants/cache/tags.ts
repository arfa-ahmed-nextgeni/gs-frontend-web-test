export enum CacheTags {
  Contentful = "contentful",
  Magento = "magento",
  RecentlyViewedProducts = "recently-viewed-products",
}

export const getRecentlyViewedProductsTagByDeviceId = (deviceId: string) =>
  `${CacheTags.RecentlyViewedProducts}:device:${deviceId}`;

export const getRecentlyViewedProductsTagByMobileNumber = (
  mobileNumber: string
) => `${CacheTags.RecentlyViewedProducts}:mobile:${mobileNumber}`;
