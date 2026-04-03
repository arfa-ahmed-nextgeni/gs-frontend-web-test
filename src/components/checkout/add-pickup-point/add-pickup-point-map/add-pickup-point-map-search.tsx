"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import SearchIcon from "@/assets/icons/search-icon.svg";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import {
  trackFodelPointSearch,
  trackRedboxPointSearch,
} from "@/lib/analytics/events";
import { ADD_PICKUP_POINT_STEPS } from "@/lib/constants/checkout/add-pickup-point-steps";
import { LockerType } from "@/lib/constants/checkout/locker-locations";

export const AddPickupPointMapSearch = () => {
  const t = useTranslations("AddPickupPointPage.map");
  const {
    currentStep,
    lockerType,
    searchQuery,
    setIsSearchFocused,
    setSearchQuery,
    setSelectedLockerId,
  } = useAddPickupPointContext();

  if (currentStep !== ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION) {
    return null;
  }

  const handleFocus = () => {
    setIsSearchFocused(true);
    setSelectedLockerId(null);
    // Track point search when search bar is clicked
    if (lockerType === LockerType.Fodel) {
      trackFodelPointSearch();
    } else if (lockerType === LockerType.Redbox) {
      trackRedboxPointSearch();
    }
  };

  return (
    <div className="absolute top-2.5 z-10 flex w-full justify-center">
      <div className="w-9/10 relative">
        <span className="absolute inset-y-0 start-0 flex items-center ps-5">
          <Image
            alt="search"
            className="size-5"
            height={20}
            src={SearchIcon}
            width={20}
          />
        </span>
        <input
          className="bg-bg-default text-text-primary placeholder:text-text-placeholder ps-15 py-2.25 block w-full rounded-3xl border-none pe-5 text-base font-normal shadow-sm focus:outline-none"
          onBlur={() => setIsSearchFocused(false)}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={t("searchLocation")}
          type="text"
          value={searchQuery}
        />
      </div>
    </div>
  );
};
