"use client";

import { useCallback, useEffect } from "react";

import Image from "next/image";

import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useTranslations } from "next-intl";

import LocationPinIcon from "@/assets/icons/location-pin-icon.svg";
import {
  LOCKER_ICONS,
  LockerType,
} from "@/lib/constants/checkout/locker-locations";
import { cn } from "@/lib/utils";

import { AddPickupPointMapControls } from "./add-pickup-point-map-controls";

import type { UnifiedLockerLocation } from "@/lib/types/checkout/locker-locations";

export const AddPickupPointMapContent = ({
  currentLocation,
  isLoadingLocations,
  lockerLocations,
  lockerType,
  onLocate,
  onPickupPointClick,
  selectedLockerId,
}: {
  currentLocation: google.maps.LatLngLiteral | null;
  isLoadingLocations: boolean;
  lockerLocations: UnifiedLockerLocation[];
  lockerType: LockerType;
  onLocate: () => void;
  onPickupPointClick: (lockerId: string) => void;
  selectedLockerId: null | string;
}) => {
  const t = useTranslations("AddPickupPointPage.map");

  const map = useMap();

  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom + 1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom - 1);
    }
  }, [map]);

  const handleLocate = useCallback(() => {
    if (currentLocation && map) {
      map.setCenter(currentLocation);
      map.setZoom(15);
    } else {
      onLocate();
    }
  }, [currentLocation, map, onLocate]);

  useEffect(() => {
    if (currentLocation && map) {
      map.setCenter(currentLocation);
      map.setZoom(10);
    }
  }, [currentLocation, map]);

  useEffect(() => {
    if (selectedLockerId && map && lockerLocations.length > 0) {
      const selectedLocker = lockerLocations.find(
        (locker) => locker.id === selectedLockerId
      );
      if (selectedLocker) {
        map.setCenter(selectedLocker.location);
        map.setZoom(15);
      }
    }
  }, [selectedLockerId, map, lockerLocations]);

  return (
    <>
      {/* Current location marker */}
      {currentLocation && (
        <AdvancedMarker
          position={currentLocation}
          title={t("yourCurrentLocation")}
        >
          <Image
            alt={t("yourCurrentLocation")}
            className="size-6"
            height={24}
            src={LocationPinIcon}
            width={24}
          />
        </AdvancedMarker>
      )}

      {/* Locker location markers */}
      {!isLoadingLocations &&
        lockerLocations.map((locker) => {
          const isSelected = selectedLockerId === locker.id;
          const iconUrl = isSelected
            ? LOCKER_ICONS[lockerType].selectedIcon
            : LOCKER_ICONS[lockerType].icon;
          const iconSize = isSelected ? 29 : 25;

          return (
            <AdvancedMarker
              key={locker.id}
              onClick={() => onPickupPointClick(locker.id)}
              position={locker.location}
              title={locker.name}
            >
              <Image
                alt={`${lockerType} locker ${locker.name}`}
                className={cn("size-6.25", isSelected && "size-7.25")}
                height={iconSize}
                src={iconUrl}
                width={iconSize}
              />
            </AdvancedMarker>
          );
        })}

      <AddPickupPointMapControls
        onLocate={handleLocate}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </>
  );
};
