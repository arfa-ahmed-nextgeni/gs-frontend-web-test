import { useEffect } from "react";

import {
  trackEmptySearchResultsFodel,
  trackEmptySearchResultsRedbox,
} from "@/lib/analytics/events";
import { LockerType } from "@/lib/constants/checkout/locker-locations";

/**
 * Hook to track empty search results for pickup point locations
 * @param searchQuery - The current search query
 * @param filteredLocationsCount - The number of filtered locations
 * @param isLoading - Whether locations are currently loading
 * @param lockerType - The type of locker (Fodel or Redbox)
 */
export function useTrackEmptySearchResults(
  searchQuery: string,
  filteredLocationsCount: number,
  isLoading: boolean,
  lockerType: LockerType
): void {
  useEffect(() => {
    if (searchQuery.trim() && filteredLocationsCount === 0 && !isLoading) {
      const trimmedQuery = searchQuery.trim();
      if (lockerType === LockerType.Fodel) {
        trackEmptySearchResultsFodel(trimmedQuery);
      } else if (lockerType === LockerType.Redbox) {
        trackEmptySearchResultsRedbox(trimmedQuery);
      }
    }
  }, [searchQuery, filteredLocationsCount, isLoading, lockerType]);
}
