import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { validateBinAction } from "@/lib/actions/checkout/validate-bin";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

export const useValidateBin = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  return useMutation({
    mutationFn: validateBinAction,
    mutationKey: MUTATION_KEYS.CART.VALIDATE_BIN({ locale }),

    onError: (error) => {
      // Handle errors silently - don't show toast errors to avoid disrupting checkout flow
      // Log error for debugging purposes
      console.error("[useValidateBin] Error validating BIN:", error);
    },

    onSettled: () => {
      // Invalidate cart queries to refresh cart data after successful BIN validation
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CART.ROOT(locale),
      });
    },
  });
};
