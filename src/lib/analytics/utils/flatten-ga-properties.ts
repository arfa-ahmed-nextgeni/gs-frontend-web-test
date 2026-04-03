/**
 * Flatten nested objects for Google Analytics 4
 * GA4 doesn't support nested objects in event parameters - they appear as "[object Object]"
 * GA4 also doesn't support dots in parameter names - they're interpreted as nested objects
 * This function recursively flattens nested objects and converts dots to underscores in keys
 * Only includes primitive values (string, number, boolean) - filters out objects, arrays, null, undefined
 *
 * @param obj - The object to flatten
 * @param prefix - Optional prefix for nested keys (used in recursion)
 * @returns Flat object with underscore-separated keys and primitive values
 *
 * @example
 * // Input: { meta: { country: 'Saudi Arabia', language: 'English' }, value: 100 }
 * // Output: { meta_country: 'Saudi Arabia', meta_language: 'English', value: 100 }
 *
 * @example
 * // Input: { 'meta.country': 'Saudi Arabia', 'meta.language': 'English' }
 * // Output: { meta_country: 'Saudi Arabia', meta_language: 'English' }
 */
export function flattenGAProperties(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, boolean | number | string> {
  const result: Record<string, boolean | number | string> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }

    // Build the key with dot notation during flattening
    const dotNotationKey = prefix ? `${prefix}.${key}` : key;

    // Handle primitive types (string, number, boolean)
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      // Convert dots to underscores for GA4 compatibility
      const ga4Key = dotNotationKey.replace(/\./g, "_");
      result[ga4Key] = value;
      continue;
    }

    // Handle arrays - convert to comma-separated string
    if (Array.isArray(value)) {
      // Filter out non-primitive values from arrays
      const primitiveValues = value.filter(
        (item) =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
      );
      if (primitiveValues.length > 0) {
        // Convert dots to underscores for GA4 compatibility
        const ga4Key = dotNotationKey.replace(/\./g, "_");
        result[ga4Key] = primitiveValues.join(",");
      }
      continue;
    }

    // Handle nested objects - recursively flatten
    if (typeof value === "object" && value !== null) {
      const flattened = flattenGAProperties(
        value as Record<string, unknown>,
        dotNotationKey
      );
      Object.assign(result, flattened);
      continue;
    }

    // Skip other types (functions, symbols, etc.)
  }

  return result;
}
