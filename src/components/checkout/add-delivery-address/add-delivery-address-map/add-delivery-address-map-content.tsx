"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useLocale, useTranslations } from "next-intl";

import LocationPinIcon from "@/assets/icons/location-pin-icon.svg";
import { AddDeliveryAddressMapControls } from "@/components/checkout/add-delivery-address/add-delivery-address-map/add-delivery-address-map-controls";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { extractGoogleAddressData } from "@/lib/utils/google-address";
import { getLocaleInfo } from "@/lib/utils/locale";

export const AddDeliveryAddressMapContent = ({
  currentLocation,
  isBottomWarningVisible,
  onLocateAction,
}: {
  currentLocation: google.maps.LatLngLiteral | null;
  isBottomWarningVisible?: boolean;
  onLocateAction: () => void;
}) => {
  const locale = useLocale();
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
  const { language: googleMapsLanguage } = getLocaleInfo(locale);

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

      geocoder.geocode(
        { language: googleMapsLanguage, location, region: "SA" },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            const primaryResult = results[0];
            const googleAddressData = extractGoogleAddressData({
              // Scan all reverse-geocode results because English components can
              // appear after an Arabic or incomplete primary result.
              addressResults: results,
              formattedAddress: primaryResult.formatted_address,
              preferEnglish: googleMapsLanguage === "en",
            });
            const address =
              googleAddressData.formattedAddress ||
              primaryResult.formatted_address;
            const countryComponent = results
              .flatMap((result) => result.address_components || [])
              .find(({ types }) => types.includes("country"));

            setSelectedAddress(address);
            setGoogleAddressData(googleAddressData);
            setIsSelectedLocationInSaudiArabia(
              countryComponent?.short_name === "SA"
            );
            return;
          }

          setIsSelectedLocationInSaudiArabia(null);
          setGoogleAddressData(null);
        }
      );
    },
    [
      geocoder,
      googleMapsLanguage,
      setGoogleAddressData,
      setIsSelectedLocationInSaudiArabia,
      setSelectedAddress,
    ]
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
      // This effect centralizes reverse geocoding for drag, search, and locate flows.
      reverseGeocode(selectedLocation);
    }
  }, [selectedLocation, geocoder, reverseGeocode]);

  // Pan to selected location when it changes (from search results)
  useEffect(() => {
    if (map && selectedLocation) {
      map.panTo(selectedLocation);
    }
  }, [map, selectedLocation]);

  // Keep the marker fixed and update the selected location when map movement ends.
  useEffect(() => {
    if (!map) return;

    const idleListener = map.addListener("idle", () => {
      const center = map.getCenter();
      if (!center) return;

      const newPosition = {
        lat: center.lat(),
        lng: center.lng(),
      };
      const isSamePosition =
        selectedLocation &&
        Math.abs(selectedLocation.lat - newPosition.lat) < 0.0000001 &&
        Math.abs(selectedLocation.lng - newPosition.lng) < 0.0000001;

      if (!isSamePosition) {
        setSelectedLocation(newPosition);
      }
    });

    return () => idleListener.remove();
  }, [map, selectedLocation, setSelectedLocation]);

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

      {/* Fixed marker; the map moves underneath it. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <Image
          alt="Selected Location"
          className="size-11"
          draggable={false}
          height={44}
          src={LocationPinIcon}
          width={44}
        />
      </div>

      <AddDeliveryAddressMapControls
        isBottomWarningVisible={isBottomWarningVisible}
        onLocate={handleLocate}
      />
    </>
  );
};
