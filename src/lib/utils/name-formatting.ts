/**
 * Detects if text contains Arabic characters
 */
export const containsArabic = (text: string): boolean => {
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

/**
 * Checks if both first and last names are fully Arabic
 */
export const isFullyArabic = (firstName: string, lastName: string): boolean => {
  return containsArabic(firstName) && containsArabic(lastName);
};

/**
 * Formats name based on locale and script
 * @param firstName - First name
 * @param lastName - Last name
 * @param locale - Current locale (e.g., 'ar', 'en')
 * @returns Formatted name string
 */
export const formatNameForLocale = (
  firstName: string,
  lastName: string,
  locale: string
): string => {
  // If displaying in Arabic/RTL context
  if (locale === "ar") {
    // If both names are Arabic, keep natural Arabic order (First + Last)
    if (isFullyArabic(firstName, lastName)) {
      return `${firstName} ${lastName}`;
    }
    // If English names or mixed, reverse for RTL display
    else {
      return `${lastName} ${firstName}`;
    }
  }
  // If displaying in English/LTR context, always use First + Last
  else {
    return `${firstName} ${lastName}`;
  }
};

/**
 * Gets formatted full name with null handling
 * @param firstName - First name (optional)
 * @param lastName - Last name (optional)
 * @param locale - Current locale
 * @returns Formatted name or null if no names provided
 */
export const getFormattedFullName = (
  firstName?: null | string,
  lastName?: null | string,
  locale: string = "en"
): null | string => {
  const validFirstName = firstName?.trim();
  const validLastName = lastName?.trim();

  if (!validFirstName && !validLastName) {
    return null;
  }

  // If we have both names, use locale-aware formatting
  if (validFirstName && validLastName) {
    return formatNameForLocale(validFirstName, validLastName, locale);
  }

  // If we only have one name, return it as is
  return validFirstName || validLastName || null;
};
