"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useCheckoutContext } from "@/contexts/checkout-context";
import { useGeolocation } from "@/hooks/queries/use-geolocation";
import { useRouter } from "@/i18n/navigation";
import {
  ADD_PICKUP_POINT_STEPS,
  AddPickupPointStep,
} from "@/lib/constants/checkout/add-pickup-point-steps";
import { LockerType } from "@/lib/constants/checkout/locker-locations";

export type AddPickupPointContextType = {
  closeDrawer: () => void;
  currentLocation: google.maps.LatLngLiteral | null;
  currentStep: AddPickupPointStep;
  customerData?: {
    email?: null | string;
    firstName?: null | string;
    lastName?: null | string;
    phoneNumber?: null | string;
  };
  isLocating: boolean;
  isPermissionDenied: boolean;
  isSearchFocused: boolean;
  locationError: Error | null;
  lockerType: LockerType;
  manualLocation: google.maps.LatLngLiteral | null;
  nextStep: () => void;
  prevStep: () => void;
  refetchLocation: () => void;
  searchQuery: string;
  selectedLockerId: null | string;
  setIsSearchFocused: (focused: boolean) => void;
  setManualLocation: (location: google.maps.LatLngLiteral | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLockerId: React.Dispatch<React.SetStateAction<null | string>>;
};

const AddPickupPointContext = createContext<
  AddPickupPointContextType | undefined
>(undefined);

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

export const AddPickupPointContextProvider = ({
  children,
  customerData,
  lockerType,
}: React.PropsWithChildren<{
  customerData?: {
    email?: null | string;
    firstName?: null | string;
    lastName?: null | string;
    phoneNumber?: null | string;
  };
  lockerType: LockerType;
}>) => {
  const router = useRouter();

  const { setCameFromShippingOptionDrawer } = useCheckoutContext();

  const [currentStep, setCurrentStep] = useState<AddPickupPointStep>(
    ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION
  );
  const [selectedLockerId, setSelectedLockerId] = useState<null | string>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [manualLocation, setManualLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const {
    data: position,
    error: geolocationError,
    isLoading: isLocating,
    refetch: refetchLocation,
  } = useGeolocation();

  // Use manual location if set, otherwise use geolocation
  const currentLocation = useMemo<google.maps.LatLngLiteral | null>(() => {
    if (manualLocation) {
      return manualLocation;
    }

    if (!position) {
      return null;
    }

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  }, [manualLocation, position]);

  const isPermissionDenied = useMemo(
    () => isPermissionDeniedError(geolocationError),
    [geolocationError]
  );

  const nextStep = useCallback(
    () =>
      setCurrentStep((prev) =>
        prev === ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION
          ? ADD_PICKUP_POINT_STEPS.ADDRESS_FORM
          : ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION
      ),
    []
  );

  const prevStep = useCallback(
    () =>
      setCurrentStep((prev) =>
        prev === ADD_PICKUP_POINT_STEPS.ADDRESS_FORM
          ? ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION
          : ADD_PICKUP_POINT_STEPS.ADDRESS_FORM
      ),
    []
  );

  const closeDrawer = useCallback(() => {
    setSearchQuery("");
    setCameFromShippingOptionDrawer(false);
    setCurrentStep(ADD_PICKUP_POINT_STEPS.LOCATION_SELECTION);
    setSelectedLockerId(null);
    router.back();
  }, [router, setCameFromShippingOptionDrawer]);

  return (
    <AddPickupPointContext.Provider
      value={{
        closeDrawer,
        currentLocation,
        currentStep,
        customerData,
        isLocating,
        isPermissionDenied,
        isSearchFocused,
        locationError: geolocationError,
        lockerType,
        manualLocation,
        nextStep,
        prevStep,
        refetchLocation,
        searchQuery,
        selectedLockerId,
        setIsSearchFocused,
        setManualLocation,
        setSearchQuery,
        setSelectedLockerId,
      }}
    >
      {children}
    </AddPickupPointContext.Provider>
  );
};

export const useAddPickupPointContext = () => {
  const context = useContext(AddPickupPointContext);
  if (!context) {
    throw new Error(
      "useAddPickupPointContext must be used within a AddPickupPointContextProvider"
    );
  }
  return context;
};
