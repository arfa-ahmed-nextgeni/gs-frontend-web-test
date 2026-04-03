/**
 * Group flat properties with dot notation into nested objects
 * Groups properties that share a common prefix (e.g., "meta.*") into nested objects
 *
 * @param obj - Flat object with dot-notation keys
 * @returns Object with nested structure based on prefixes
 *
 * @example
 * // Input: { 'meta.country': 'Saudi Arabia', 'meta.language': 'English', 'meta.is_guest': true, value: 100 }
 * // Output: { meta: { country: 'Saudi Arabia', language: 'English', is_guest: true }, value: 100 }
 */
export function groupPropertiesByPrefix(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const nested: Record<string, Record<string, unknown>> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }

    // Check if key contains a dot (indicating a prefix)
    const dotIndex = key.indexOf(".");
    if (dotIndex > 0) {
      const prefix = key.substring(0, dotIndex);
      const suffix = key.substring(dotIndex + 1);

      // Initialize nested object for this prefix if it doesn't exist
      if (!nested[prefix]) {
        nested[prefix] = {};
      }

      // Add the property to the nested object
      nested[prefix][suffix] = value;
    } else {
      // No prefix, add directly to result
      result[key] = value;
    }
  }

  // Merge nested objects into result
  Object.assign(result, nested);

  return result;
}
