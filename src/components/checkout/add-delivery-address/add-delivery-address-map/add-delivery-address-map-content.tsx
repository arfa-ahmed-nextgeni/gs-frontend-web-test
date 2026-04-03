"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useTranslations } from "next-intl";

import LocationPinIcon from "@/assets/icons/location-pin-icon.svg";
import { AddDeliveryAddressMapControls } from "@/components/checkout/add-delivery-address/add-delivery-address-map/add-delivery-address-map-controls";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { extractGoogleAddressData } from "@/lib/utils/google-address";

export const AddDeliveryAddressMapContent = ({
  currentLocation,
  defaultCenter,
  isBottomWarningVisible,
  onLocateAction,
}: {
  currentLocation: google.maps.LatLngLiteral | null;
  defaultCenter: google.maps.LatLngLiteral;
  isBottomWarningVisible?: boolean;
  onLocateAction: () => void;
}) => {
  const t = useTranslations("AddDeliveryAddressPage.map");
  const {
    selectedLocation,
    setGoogleAddressData,
    setIsSelectedLocationInSaudiArabia,
    setSelectedAddress,
    setSelectedLocation,
  } = useAddDeliveryAddressContext();

  const map = useMap();
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  // Initialize geocoder
  useEffect(() => {
    if (window.google && !geocoder) {
      setGeocoder(new google.maps.Geocoder());
    }
  }, [geocoder]);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(
    (location: google.maps.LatLngLiteral) => {
      if (!geocoder) return;

      geocoder.geocode({ location }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          const primaryResult = results[0];
          const address = primaryResult.formatted_address;
          const countryComponent = primaryResult.address_components?.find(
            ({ types }) => types.includes("country")
          );

          setSelectedAddress(address);
          setGoogleAddressData(
            extractGoogleAddressData({
              addressComponents: primaryResult.address_components,
              formattedAddress: address,
            })
          );
          setIsSelectedLocationInSaudiArabia(
            countryComponent?.short_name === "SA"
          );
          return;
        }

        setIsSelectedLocationInSaudiArabia(null);
        setGoogleAddressData(null);
      });
    },
    [
      geocoder,
      setGoogleAddressData,
      setIsSelectedLocationInSaudiArabia,
      setSelectedAddress,
    ]
  );

  // Handle draggable marker drag end
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newPosition = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };
        setSelectedLocation(newPosition);
        // Get address for the new position
        reverseGeocode(newPosition);
        // Center map on the new marker position
        if (map) {
          map.panTo(newPosition);
        }
      }
    },
    [setSelectedLocation, reverseGeocode, map]
  );

  // const handleZoomIn = useCallback(() => {
  //   if (map) {
  //     const currentZoom = map.getZoom() || 13;
  //     map.setZoom(currentZoom + 1);
  //   }
  // }, [map]);

  // const handleZoomOut = useCallback(() => {
  //   if (map) {
  //     const currentZoom = map.getZoom() || 13;
  //     map.setZoom(currentZoom - 1);
  //   }
  // }, [map]);

  const handleLocate = useCallback(() => {
    if (currentLocation && map) {
      map.setCenter(currentLocation);
      map.setZoom(15);
      setSelectedLocation(currentLocation);
    } else {
      onLocateAction();
    }
  }, [currentLocation, map, onLocateAction, setSelectedLocation]);

  // Initialize selected location with current location when available
  useEffect(() => {
    if (currentLocation && map && !selectedLocation) {
      map.setCenter(currentLocation);
      map.setZoom(13);
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation, map, selectedLocation, setSelectedLocation]);

  // Reverse geocode selected location to get formatted address
  useEffect(() => {
    if (selectedLocation && geocoder) {
      reverseGeocode(selectedLocation);
    }
  }, [selectedLocation, geocoder, reverseGeocode]);

  // Pan to selected location when it changes (from search results)
  useEffect(() => {
    if (map && selectedLocation) {
      map.panTo(selectedLocation);
    }
  }, [map, selectedLocation]);

  // Determine marker position - prioritize selected location, fallback to current location, then default center
  const markerPosition = selectedLocation || currentLocation || defaultCenter;

  useEffect(() => {
    console.info("[MapContent] selectedLocation changed:", {
      currentLocation,
      markerPosition,
      selectedLocation,
    });
  }, [selectedLocation, markerPosition, currentLocation]);

  return (
    <>
      {/* Current location indicator (small blue dot) */}
      {currentLocation && currentLocation !== selectedLocation && (
        <AdvancedMarker
          position={currentLocation}
          title={t("yourCurrentLocation")}
        >
          <div className="h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
        </AdvancedMarker>
      )}

      {/* Main draggable marker for selected location */}
      <AdvancedMarker
        draggable={true}
        onDragEnd={handleMarkerDragEnd}
        position={markerPosition}
        title="Selected Location"
      >
        <Image
          alt="Selected Location"
          className="size-8 cursor-grab active:cursor-grabbing"
          draggable={false} // Prevent image drag, let marker handle it
          height={32}
          src={LocationPinIcon}
          style={{ filter: "hue-rotate(10deg) saturate(150%)" }}
          width={32}
        />
      </AdvancedMarker>

      {/* Fixed center crosshair for map-centered location selection - DISABLED */}
      {/* <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Crosshair indicator */}
      {/* <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <div className="h-4 w-4 rounded-full border-2 border-red-500 bg-white opacity-80 shadow-lg" />
          </div> */}
      {/* Instructional text */}
      {/* <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-black bg-opacity-75 px-2 py-1 text-xs text-white">
            {t("moveMapInstructions")}
          </div> */}
      {/* </div> */}
      {/* </div> */}

      <AddDeliveryAddressMapControls
        isBottomWarningVisible={isBottomWarningVisible}
        onLocate={handleLocate}
      />
    </>
  );
};
