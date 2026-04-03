"use client";

import { useCallback, useMemo } from "react";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useTranslations } from "next-intl";

import { AddPickupPointMapContent } from "@/components/checkout/add-pickup-point/add-pickup-point-map/add-pickup-point-map-content";
import { AddPickupPointMapSearch } from "@/components/checkout/add-pickup-point/add-pickup-point-map/add-pickup-point-map-search";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import { useLockerLocations } from "@/hooks/queries/use-locker-locations";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  trackSelectFodelPointFromMap,
  trackSelectRedboxPointFromMap,
} from "@/lib/analytics/events";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
} from "@/lib/config/client-env";
import { ADD_PICKUP_POINT_STEPS } from "@/lib/constants/checkout/add-pickup-point-steps";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER = { lat: 25.1234, lng: 55.2345 };

export const AddPickupPointMap = () => {
  const t = useTranslations("AddPickupPointPage.map");
  const isMobile = useIsMobile();

  const {
    currentLocation,
    currentStep,
    isLocating,
    isPermissionDenied,
    isSearchFocused,
    locationError,
    lockerType,
    refetchLocation,
    selectedLockerId,
    setSelectedLockerId,
  } = useAddPickupPointContext();

  const { data: lockerLocations = [], isLoading: isLoadingLocations } =
    useLockerLocations(
      currentLocation
        ? {
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            type: lockerType,
          }
        : null
    );

  const { searchQuery } = useAddPickupPointContext();

  const filteredLockerLocations = useMemo(() => {
    if (!searchQuery.trim()) {
      return lockerLocations;
    }

    const query = searchQuery.toLowerCase().trim();
    return lockerLocations.filter(
      (locker) =>
        locker.name.toLowerCase().includes(query) ||
        locker.address.toLowerCase().includes(query) ||
        (locker.nameAr && locker.nameAr.toLowerCase().includes(query)) ||
        (locker.addressAr && locker.addressAr.toLowerCase().includes(query))
    );
  }, [lockerLocations, searchQuery]);

  const handlePickupPointClick = useCallback(
    (lockerId: string) => {
      // Only allow selecting a locker, not unselecting
      // User must select a different locker to change selection
      setSelectedLockerId(lockerId);

      // Track map selection when a point is selected from the map
      if (lockerType === LockerType.Fodel) {
        trackSelectFodelPointFromMap();
      } else if (lockerType === LockerType.Redbox) {
        trackSelectRedboxPointFromMap();
      }
    },
    [lockerType, setSelectedLockerId]
  );

  const defaultCenter = currentLocation || DEFAULT_CENTER;
  const hasPermission = !!currentLocation;
  const isAddressFormStep = currentStep === ADD_PICKUP_POINT_STEPS.ADDRESS_FORM;

  const containerClassName = cn(
    "relative flex-shrink-0 transition-default",
    isMobile && isSearchFocused
      ? "h-0"
      : isMobile && isAddressFormStep
        ? "h-[35vh]"
        : "h-1/2"
  );

  if (isLocating) {
    return (
      <div className={containerClassName}>
        <div className="flex h-full items-center justify-center">
          <div className="bg-bg-default rounded-lg px-4 py-2 shadow-lg">
            <p className="text-text-primary text-sm">
              {t("gettingYourLocation")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isPermissionDenied || (!hasPermission && locationError)) {
    return (
      <div className={containerClassName}>
        <div className="flex h-full items-center justify-center">
          <div className="bg-bg-default mx-4 max-w-md rounded-lg px-4 py-2 shadow-lg">
            <p className="text-text-primary mb-2 text-sm font-medium">
              {t("locationPermissionRequired")}
            </p>
            <p className="text-text-secondary mb-3 text-xs">
              {t("pleaseAllowLocationAccess")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          disableDefaultUI
          gestureHandling="greedy"
          mapId={GOOGLE_MAPS_MAP_ID}
          style={{ height: "100%", width: "100%" }}
        >
          <AddPickupPointMapContent
            currentLocation={currentLocation}
            isLoadingLocations={isLoadingLocations}
            lockerLocations={filteredLockerLocations}
            lockerType={lockerType}
            onLocate={refetchLocation}
            onPickupPointClick={handlePickupPointClick}
            selectedLockerId={selectedLockerId}
          />
        </Map>
      </APIProvider>
      <AddPickupPointMapSearch />
    </div>
  );
};
