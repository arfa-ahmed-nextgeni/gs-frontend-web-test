"use client";

import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useOfflineToast } from "@/hooks/ui/use-offline-toast";
import { reverseMokafaaPoints } from "@/lib/actions/alrajhi-mokafaa/reverse-points";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { mutationPrefix } from "@/lib/utils/mutation-key";
import { isError } from "@/lib/utils/service-result";

export const useReverseMokafaaPoints = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const { showOfflineMessage } = useOfflineToast();

  const activeMutations = useIsMutating({
    mutationKey: mutationPrefix(MUTATION_KEYS.MOKAFAA.REVERSE({ locale })),
  });

  return useMutation({
    mutationFn: reverseMokafaaPoints,
    mutationKey: MUTATION_KEYS.MOKAFAA.REVERSE({ locale }),

    onError: () => {
      if (!navigator.onLine) showOfflineMessage();
    },

    onSettled: async (data) => {
      if (isError(data!)) return;
      if (activeMutations > 1) return;

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CART.ROOT(locale),
      });
    },
  });
};
