// Utility function to check if flash sale is active based on Contentful timezone
export const isFlashSaleActive = (
  startTime?: string,
  endTime?: string,
  products?: any[],
  saleProductCategoryId?: string,
  startTimezone?: string,
  endTimezone?: string
) => {
  const now = new Date();

  // Convert start time to UTC for comparison
  const startTimeUTC =
    startTime && startTimezone
      ? new Date(startTime + (startTimezone === "UTC" ? "Z" : startTimezone))
      : startTime
        ? new Date(startTime)
        : null;

  // Convert end time to UTC for comparison
  const endTimeUTC =
    endTime && endTimezone
      ? new Date(endTime + (endTimezone === "UTC" ? "Z" : endTimezone))
      : endTime
        ? new Date(endTime)
        : null;

  const hasStarted = !startTimeUTC || startTimeUTC <= now;
  const hasNotEnded = !endTimeUTC || endTimeUTC > now;
  const hasProducts =
    products && Array.isArray(products) && products.length > 0;
  const hasCategoryId = saleProductCategoryId;

  return hasStarted && hasNotEnded && (hasProducts || hasCategoryId);
};
