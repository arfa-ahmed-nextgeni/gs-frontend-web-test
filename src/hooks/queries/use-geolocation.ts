import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/constants/query-keys";

interface UseGeolocationOptions {
  enabled?: boolean;
}

const getCurrentLocationPromise = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        console.error("❌ [Geolocation] Error:", {
          code: error.code,
          codeDescription:
            error.code === 1
              ? "Permission denied"
              : error.code === 2
                ? "Position unavailable"
                : error.code === 3
                  ? "Timeout"
                  : "Unknown",
          message: error.message,
        });
        reject(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  });
};

export const useGeolocation = ({
  enabled = true,
}: UseGeolocationOptions = {}) => {
  return useQuery<GeolocationPosition, Error>({
    enabled,
    queryFn: async (): Promise<GeolocationPosition> => {
      const position = await getCurrentLocationPromise();
      return position;
    },
    queryKey: QUERY_KEYS.GEOLOCATION,
  });
};
