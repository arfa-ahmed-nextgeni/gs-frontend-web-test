import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { addProductToWishlist } from "@/lib/actions/customer/wishlist/add-product-to-wishlist";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Wishlist } from "@/lib/models/wishlist";
import { isError } from "@/lib/utils/service-result";

export const useAddProductToWishlist = ({
  selectedOptionId,
  skipSuccessMessage,
  sku,
}: {
  selectedOptionId?: string;
  skipSuccessMessage?: boolean;
  sku: string;
}) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { showOfflineMessage } = useOfflineToast();

  return useMutation({
    mutationFn: addProductToWishlist,
    mutationKey: MUTATION_KEYS.WISHLIST.ADD({
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
        toast({
          title: data.error,
          type: "error",
        });
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

      if (!skipSuccessMessage) {
        toast({
          title: data.data.message,
          type: "success",
        });
      }
    },
  });
};
