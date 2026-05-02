import type { QueryClient } from "@tanstack/react-query";

import { getCustomerQueryConfig } from "@/hooks/queries/use-customer-query";
import { getWishlistQueryConfig } from "@/hooks/queries/wishlist/use-wishlist-query";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

import type { Locale } from "@/lib/constants/i18n";

export async function syncPostAuthQueries({
  locale,
  queryClient,
}: {
  locale: Locale;
  queryClient: QueryClient;
}) {
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.CART.ROOT(locale),
  });

  const [customer, wishlist] = await Promise.all([
    queryClient.fetchQuery(getCustomerQueryConfig(locale)),
    queryClient.fetchQuery(getWishlistQueryConfig(locale)),
  ]);

  return {
    customer,
    wishlist,
  };
}
