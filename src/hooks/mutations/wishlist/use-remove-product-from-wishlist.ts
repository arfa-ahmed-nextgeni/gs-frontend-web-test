import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { removeProductFromWishlist } from "@/lib/actions/customer/wishlist/remove-product-from-wishlist";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Wishlist } from "@/lib/models/wishlist";
import { isError } from "@/lib/utils/service-result";

export const useRemoveProductFromWishlist = ({
  selectedOptionId,
  sku,
}: {
  selectedOptionId?: string;
  sku: string;
}) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showError, showSuccess } = useToastContext();
  const { showOfflineMessage } = useOfflineToast();

  return useMutation({
    mutationFn: removeProductFromWishlist,
    mutationKey: MUTATION_KEYS.WISHLIST.REMOVE({
      locale,
      selectedOptionId,
      sku,
    }),

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

      if (!data) {
        return;
      }

      queryClient.setQueryData<Wishlist>(
        QUERY_KEYS.WISHLIST.FULL(locale),
        data.data.wishlist
      );
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "wishlist" &&
          query.queryKey[1] === locale &&
          query.queryKey[2] === "paginated",
      });

      showSuccess(data.data.message, " ");
    },
  });
};
