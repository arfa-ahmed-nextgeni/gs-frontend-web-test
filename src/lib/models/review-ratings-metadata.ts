import { GetProductReviewRatingsMetadataQuery } from "@/graphql/graphql";

export class ReviewRatingsMetadata {
  ratings: Map<string, { id: string; values: Map<string, string> }>;

  constructor(data: GetProductReviewRatingsMetadataQuery) {
    this.ratings = new Map();

    data.productReviewRatingsMetadata.items?.forEach((item) => {
      if (!item?.name || !item?.id) return;

      const valueMap = new Map<string, string>();
      item.values?.forEach((v) => {
        if (v?.value_id && v?.value) valueMap.set(v.value, v.value_id);
      });

      this.ratings.set(item.name, {
        id: item.id,
        values: valueMap,
      });
    });
  }
}
