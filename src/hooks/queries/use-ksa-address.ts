"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { getKsaAddress } from "@/lib/actions/customer/get-ksa-address";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

interface UseKsaAddressQueryOptions {
  enabled?: boolean;
  latitude?: number;
  longitude?: number;
}

export const useKsaAddressQuery = ({
  enabled = true,
  latitude,
  longitude,
}: UseKsaAddressQueryOptions) => {
  const locale = useLocale();
  const hasCoordinates =
    typeof latitude === "number" && typeof longitude === "number";

  return useQuery({
    enabled: enabled && hasCoordinates,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      const result = await getKsaAddress({
        latitude: latitude!,
        longitude: longitude!,
      });

      return result.data;
    },
    queryKey: QUERY_KEYS.KSA_ADDRESS({
      latitude: latitude ?? 0,
      locale,
      longitude: longitude ?? 0,
    }),
    // This validation only needs to rerun when coordinates actually change.
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000,
  });
};
