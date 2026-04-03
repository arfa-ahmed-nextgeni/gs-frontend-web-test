"use client";

import { useEffect, useMemo } from "react";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useLocale, useTranslations } from "next-intl";

import { AddDeliveryAddressMapContent } from "@/components/checkout/add-delivery-address/add-delivery-address-map/add-delivery-address-map-content";
import { AddDeliveryAddressMapSearch } from "@/components/checkout/add-delivery-address/add-delivery-address-map/add-delivery-address-map-search";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { useGeolocation } from "@/hooks/queries/use-geolocation";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
} from "@/lib/config/client-env";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER = { lat: 25.1234, lng: 55.2345 };
const RIYADH_CENTER = { lat: 24.7136, lng: 46.6753 };

const isPermissionDeniedError = (error: Error | null): boolean => {
  if (!error) return false;

  const geolocationError = error as Error & GeolocationPositionError;
  if (geolocationError.code === 1) {
    return true;
  }

  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes("permission") ||
    errorMessage.includes("denied") ||
    errorMessage.includes("not allowed")
  );
};

export const AddDeliveryAddressMap = () => {
  const locale = useLocale();
  const t = useTranslations("AddDeliveryAddressPage.map");

  const {
    initialSelectedLocation,
    isSelectedLocationInSaudiArabia,
    selectedLocation,
    setCurrentLocation,
  } = useAddDeliveryAddressContext();
  const shouldRequestCurrentLocation =
    !selectedLocation && !initialSelectedLocation;

  const {
    data: position,
    error: geolocationError,
    isLoading: isLocating,
    refetch: refetchLocation,
  } = useGeolocation({
    enabled: shouldRequestCurrentLocation,
  });

  useEffect(() => {
    console.info("[AddDeliveryAddressMap] Component mounted", {
      apiKey: GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY}` : "NOT SET",
      mapId: GOOGLE_MAPS_MAP_ID,
    });
  }, []);

  // Convert GeolocationPosition to LatLngLiteral
  const currentLocation = useMemo<google.maps.LatLngLiteral | null>(() => {
    if (!position) return null;

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  }, [position]);

  // Update context with current location as a side effect
  useEffect(() => {
    if (currentLocation) {
      setCurrentLocation(currentLocation);
    }
  }, [currentLocation, setCurrentLocation]);

  const isPermissionDenied = isPermissionDeniedError(geolocationError);
  const locationError = geolocationError;

  const defaultCenter =
    selectedLocation ||
    currentLocation ||
    (isPermissionDenied ? RIYADH_CENTER : DEFAULT_CENTER);
  const hasPermission =
    !!currentLocation || !!initialSelectedLocation || !!selectedLocation;
  const googleMapsLanguage = locale?.toLowerCase().startsWith("ar")
    ? "ar"
    : "en";

  const containerClassName = cn(
    "relative flex-shrink-0 transition-default",
    // Mobile: dynamic height with 350px reserved for bottom buttons
    "h-[min(65vh,calc(100vh-350px))]",
    // Tablet: increase to 70% viewport height
    "sm:h-[min(70vh,calc(100vh-350px))]",
    // Desktop: increase to 75% viewport height, always reserve 350px minimum for buttons
    "md:h-[min(75vh,calc(100vh-350px))]",
    // Ensure minimum usable height
    "md:min-h-[400px]"
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

  if (
    (isPermissionDenied && !initialSelectedLocation) ||
    (!hasPermission && locationError)
  ) {
    return (
      <div className={containerClassName}>
        <APIProvider
          apiKey={GOOGLE_MAPS_API_KEY}
          language={googleMapsLanguage}
          libraries={["places"]}
        >
          <Map
            defaultCenter={RIYADH_CENTER}
            defaultZoom={13}
            disableDefaultUI
            gestureHandling="auto"
            mapId={GOOGLE_MAPS_MAP_ID}
            style={{ height: "100%", width: "100%" }}
          >
            <AddDeliveryAddressMapContent
              currentLocation={currentLocation}
              onLocateAction={refetchLocation}
            />
          </Map>
          <AddDeliveryAddressMapSearch />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
            <div className="rounded-[8px] bg-[rgba(55,73,87,0.90)] p-[15px] shadow-lg">
              <p className="text-sm text-white">
                {t("enableLocationServices")}
              </p>
            </div>
          </div>
        </APIProvider>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <APIProvider
        apiKey={GOOGLE_MAPS_API_KEY}
        language={googleMapsLanguage}
        libraries={["places"]}
      >
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          disableDefaultUI
          gestureHandling="auto"
          mapId={GOOGLE_MAPS_MAP_ID}
          style={{ height: "100%", width: "100%" }}
        >
          <AddDeliveryAddressMapContent
            currentLocation={currentLocation}
            onLocateAction={refetchLocation}
          />
        </Map>
        <AddDeliveryAddressMapSearch />
        {selectedLocation && isSelectedLocationInSaudiArabia === false && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <p className="text-sm font-medium text-red-700">
                {t("locationOutsideSaudiArabia")}
              </p>
            </div>
          </div>
        )}
      </APIProvider>
    </div>
  );
};
