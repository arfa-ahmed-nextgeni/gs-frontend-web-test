import { SortEnum, SortQuoteItemsEnum } from "@/graphql/graphql";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";

import type { QuoteItemsSortInput } from "@/graphql/graphql";

type CartItemsQueryVariables = {
  page: number;
  pageSize: number;
  sort: QuoteItemsSortInput;
};

export const DEFAULT_CART_ITEMS_QUERY_VARIABLES: CartItemsQueryVariables = {
  page: 1,
  pageSize: MAX_PAGE_SIZE,
  sort: {
    field: SortQuoteItemsEnum.UpdatedAt,
    order: SortEnum.Desc,
  },
};
