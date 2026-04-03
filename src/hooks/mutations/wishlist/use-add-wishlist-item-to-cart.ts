import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { useRouteMatch } from "@/hooks/use-route-match";
import { addWishlistItemToCartAction } from "@/lib/actions/customer/wishlist/add-wishlist-item-to-cart";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Wishlist } from "@/lib/models/wishlist";
import { mutationPrefix } from "@/lib/utils/mutation-key";
import { isError } from "@/lib/utils/service-result";

export const useAddWishlistItemToCart = ({ sku }: { sku: string }) => {
  const { isCart } = useRouteMatch();
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showError } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  const { openCartDrawer } = useCartDrawer();

  const activeMoveToCartMutations = useIsMutating({
    mutationKey: mutationPrefix(
      MUTATION_KEYS.WISHLIST.MOVE_TO_CART({ locale, sku })
    ),
  });

  return useMutation({
    mutationFn: addWishlistItemToCartAction,
    mutationKey: MUTATION_KEYS.WISHLIST.MOVE_TO_CART({ locale, sku }),

    onError: () => {
      if (!navigator.onLine) {
        showOfflineMessage();
      }
    },

    onSettled: async (data) => {
      if (isError(data!)) {
        showError(data.error, " ");
        return;
      }

      if (activeMoveToCartMutations > 1) return;
      if (!data) return;

      queryClient.setQueryData<Wishlist>(
        QUERY_KEYS.WISHLIST.FULL(locale),
        data.data.wishlist
      );

      await Promise.allSettled([
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "wishlist" &&
            query.queryKey[1] === locale &&
            query.queryKey[2] === "paginated",
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CART.ROOT(locale),
        }),
      ]);

      if (!isCart) {
        openCartDrawer();
      }
    },
  });
};
