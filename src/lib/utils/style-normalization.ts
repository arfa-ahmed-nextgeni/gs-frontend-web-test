import type { CSSProperties } from "react";

/**
 * Normalize CSS style object to ensure consistent rendering between server and client
 * This prevents hydration mismatches when passing styles from Server to Client Components
 */
export function normalizeStyles(
  style: CSSProperties | undefined
): CSSProperties | undefined {
  if (!style || typeof style !== "object") {
    return undefined;
  }

  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(style)) {
    // Skip null, undefined, or empty string values
    if (value === null || value === undefined || value === "") {
      continue;
    }

    // Skip properties with default values that might cause hydration issues
    if (
      (key === "borderLeftWidth" || key === "border-left-width") &&
      (value === "0px" || value === "0" || value === 0)
    ) {
      continue;
    }

    // Convert color values to consistent format
    if (
      (key === "color" || key === "backgroundColor" || key === "borderColor") &&
      typeof value === "string"
    ) {
      normalized[key] = normalizeColor(value);
    } else {
      normalized[key] = value;
    }
  }

  return Object.keys(normalized).length > 0
    ? (normalized as CSSProperties)
    : undefined;
}

/**
 * Normalize color values to hex format for consistency
 */
function normalizeColor(color: string): string {
  // If it's already in hex format, return as-is
  if (color.startsWith("#")) {
    return color.toLowerCase();
  }

  // Convert rgb(r, g, b) to hex
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Return original if can't parse
  return color;
}
