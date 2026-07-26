import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { useHandleAuthRevoked } from "@/hooks/auth/use-handle-auth-revoked";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { useRouteMatch } from "@/hooks/use-route-match";
import { addWishlistItemToCartAction } from "@/lib/actions/customer/wishlist/add-wishlist-item-to-cart";
import {
  trackAddToCart,
  trackRemoveFromWishlist,
} from "@/lib/analytics/events";
import { ProductProperties } from "@/lib/analytics/models/event-models";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Cart } from "@/lib/models/cart";
import { Wishlist } from "@/lib/models/wishlist";
import { mutationPrefix } from "@/lib/utils/mutation-key";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

export const useAddWishlistItemToCart = ({
  product,
  sku,
}: {
  product?: Partial<ProductProperties>;
  sku: string;
}) => {
  const { isCart } = useRouteMatch();
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showError } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  const { openCartDrawer } = useCartDrawer();

  const handleAuthRevoked = useHandleAuthRevoked();

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
      if (isUnauthenticated(data!)) {
        await handleAuthRevoked();
        return;
      }

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

      trackRemoveFromWishlist(sku);
      trackAddToCart(
        {
          "product.sku": sku,
          ...product,
          [`product.${sku}.qty_in_cart`]: 1,
        },
        queryClient.getQueryData<Cart>(QUERY_KEYS.CART.FULL(locale))
      );

      if (!isCart) {
        openCartDrawer();
      }
    },
  });
};
