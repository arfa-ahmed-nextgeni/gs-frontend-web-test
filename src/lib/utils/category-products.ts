export function generateAdIndexes({
  colsDesktop,
  colsMobile,
  largeDesktopIndex = 18,
  largeMobileIndex = 3,
  totalItems,
}: {
  colsDesktop: number;
  colsMobile: number;
  largeDesktopIndex?: number;
  largeMobileIndex?: number;
  totalItems: number;
}) {
  // Calculate maximum reasonable lengths based on total items
  const maxDesktopAds = Math.floor(totalItems / colsDesktop);
  const maxMobileAds = Math.floor(totalItems / colsMobile);

  // Pattern 1 for desktop: [5,6,7,8,9], [14,15,16,17,18], etc.
  // Formula: start = 5 + (index * 9), range = 5 numbers
  const smallDesktop = generateRandomArrayCustom(5, 9, 5, maxDesktopAds);

  // Pattern 2 for mobile: [2,3], [5,6], [8,9], etc.
  // Formula: start = 2 + (index * 3), range = 2 numbers
  const smallMobile = generateRandomArrayCustom(2, 3, 2, maxMobileAds);

  return {
    largeDesktopIndex,
    largeMobileIndex,
    smallDesktop,
    smallMobile,
  };
}

function generateRandomArrayCustom(
  startValue: number,
  increment: number,
  rangeSize: number,
  length: number
) {
  const result = [];

  for (let i = 0; i < length; i++) {
    const indexStartValue = startValue + i * increment;
    const randomOffset = Math.floor(Math.random() * rangeSize);
    result[i] = indexStartValue + randomOffset;
  }

  return result;
}
