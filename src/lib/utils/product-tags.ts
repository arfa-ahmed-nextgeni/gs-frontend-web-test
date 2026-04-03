import type { ProductTagStyle } from "@/lib/types/product/product-tags";

export const parseProductTagAttributes = (
  tagAttributes: string
): ProductTagStyle => {
  if (!tagAttributes) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(tagAttributes);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const attributes = parsed as Record<string, unknown>;
    const backgroundColor =
      typeof attributes.backgroundColor === "string"
        ? attributes.backgroundColor
        : undefined;
    const color =
      typeof attributes.color === "string" ? attributes.color : undefined;

    return { backgroundColor, color };
  } catch {
    return {};
  }
};
