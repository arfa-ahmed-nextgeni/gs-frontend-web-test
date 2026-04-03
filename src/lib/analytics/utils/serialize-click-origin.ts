import type { ClickOrigin } from "../models/event-models";

/**
 * Serialize click origin object into flat key-value pairs for Amplitude
 * All properties are prefixed with "click."
 * Nested objects (like "extra" in lp origin) are flattened with dot notation
 * Only includes defined properties (no undefined/null values)
 *
 * @param origin - The click origin to serialize
 * @returns Flat object with "click.*" prefixed keys ready for Amplitude
 *
 * @example
 * // Input: {origin: "lp", row: 1, column: 3, extra: {type: "category-slider", categoryid: 2575}}
 * // Output: {"click.origin": "lp", "click.row": 1, "click.column": 3, "click.extra.type": "category-slider", "click.extra.categoryid": 2575}
 */
export function serializeClickOrigin(
  origin: ClickOrigin | null
): Record<string, unknown> {
  if (!origin) {
    return {};
  }

  const result: Record<string, unknown> = {
    "click.origin": origin.origin,
  };

  // Handle top_menu origin
  if (origin.origin === "top_menu") {
    result["click.position"] = origin.position;
    if (origin.vertical !== undefined) {
      result["click.vertical"] = origin.vertical;
    }
    if (origin.lp_id !== undefined) {
      result["click.lp_id"] = origin.lp_id;
    }
  }

  // Handle category_tab origin
  if (origin.origin === "category_tab") {
    result["click.level1"] = origin.level1;
    result["click.level2"] = origin.level2;
    result["click.position"] = origin.position;
  }

  // Handle lp origin
  if (origin.origin === "lp") {
    result["click.row"] = origin.row;
    result["click.column"] = origin.column;
    if (origin.inner_position !== undefined) {
      result["click.inner_position"] = origin.inner_position;
    }
    // Flatten extra object with "click.extra.*" prefix
    if (origin.extra) {
      Object.entries(origin.extra).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          result[`click.extra.${key}`] = value;
        }
      });
    }
  }

  // Handle plp origin
  if (origin.origin === "plp") {
    result["click.categoryId"] = origin.categoryId;
    result["click.position"] = origin.position;
  }

  // Handle search origin
  if (origin.origin === "search") {
    result["click.term"] = origin.term;
    result["click.position"] = origin.position;
  }

  return result;
}
