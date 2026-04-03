import { parseAsString, useQueryState } from "nuqs";

import { QueryParamsKey } from "@/lib/constants/query-params";

export const useCategoryParam = () => {
  const [categoryId, setCategoryId] = useQueryState(
    QueryParamsKey.CategoryId,
    parseAsString.withDefault("all-brands")
  );

  return { categoryId, setCategoryId };
};
