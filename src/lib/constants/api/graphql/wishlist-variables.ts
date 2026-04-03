import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";

type WishlistItemsQueryVariables = {
  page: number;
  pageSize: number;
};

export const DEFAULT_WISHLIST_ITEMS_QUERY_VARIABLES: WishlistItemsQueryVariables =
  {
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  };
