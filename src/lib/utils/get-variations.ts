import groupBy from "lodash/groupBy";

import { Variation } from "@/lib/types/ui-types";

export function getVariations(variations: Variation[] = []) {
  // Flatten all attribute values from variations
  const allAttributes = variations.flatMap((variation) => {
    if (!variation?.attribute?.values) return [];
    return variation.attribute.values.map((val) => ({
      attribute_id: val.attribute_id,
      attributeSlug: variation.attribute.slug,
      attributeType: variation.attribute.type, // ADD type
      id: val.id,
      image: val.image,
      value: val.value,
    }));
  });

  // Group by attributeSlug (example: color, memory-storage)
  const grouped = groupBy(allAttributes, "attributeSlug");

  // Clean up grouped result
  const cleaned = Object.keys(grouped).reduce((acc: any, key) => {
    acc[key] = {
      options: grouped[key].map(({ attribute_id, id, image, value }) => ({
        attribute_id,
        id,
        image,
        value,
      })),
      type: grouped[key][0].attributeType,
    };
    return acc;
  }, {});

  return cleaned;
}
