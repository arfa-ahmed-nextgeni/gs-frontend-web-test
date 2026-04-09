"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import type { GoogleAddressData } from "@/lib/utils/google-address";

interface AddDeliveryAddressContextType {
  currentLocation: google.maps.LatLngLiteral | null;
  customerData: CustomerData;
  deliveryType: string;
  googleAddressData: GoogleAddressData | null;
  initialContactData: InitialContactData | null;
  initialSelectedLocation: google.maps.LatLngLiteral | null;
  isManualEntryMode: boolean;
  isSelectedLocationInSaudiArabia: boolean | null;
  ksaAddress: KsaNationalAddress | null;
  resetFlowState: () => void;
  selectedAddress: null | string;
  selectedLocation: google.maps.LatLngLiteral | null;
  setCurrentLocation: (location: google.maps.LatLngLiteral | null) => void;
  setGoogleAddressData: (address: GoogleAddressData | null) => void;
  setIsManualEntryMode: (isManualEntryMode: boolean) => void;
  setIsSelectedLocationInSaudiArabia: (isInSaudiArabia: boolean | null) => void;
  setKsaAddress: (address: KsaNationalAddress | null) => void;
  setSelectedAddress: (address: null | string) => void;
  setSelectedLocation: (location: google.maps.LatLngLiteral | null) => void;
  setShowSaveForm: (show: boolean) => void;
  showSaveForm: boolean;
}

interface CustomerData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

interface InitialContactData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface KsaNationalAddress {
  additionalNumber?: string;
  address1?: string;
  address2?: string;
  buildingNumber?: string;
  city?: string;
  cityId?: string;
  district?: string;
  language?: string;
  latitude?: string;
  longitude?: string;
  postCode?: string;
  region?: string;
  short_address?: string;
  street?: string;
}

const AddDeliveryAddressContext =
  createContext<AddDeliveryAddressContextType | null>(null);

interface AddDeliveryAddressContextProviderProps {
  children: ReactNode;
  customerData: CustomerData;
  deliveryType: string;
  initialContactData?: InitialContactData | null;
  initialSelectedLocation?: google.maps.LatLngLiteral | null;
}

export function AddDeliveryAddressContextProvider({
  children,
  customerData,
  deliveryType,
  initialContactData = null,
  initialSelectedLocation = null,
}: AddDeliveryAddressContextProviderProps) {
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [googleAddressData, setGoogleAddressData] =
    useState<GoogleAddressData | null>(null);
  const [isManualEntryMode, setIsManualEntryMode] = useState(false);
  const [isSelectedLocationInSaudiArabia, setIsSelectedLocationInSaudiArabia] =
    useState<boolean | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(initialSelectedLocation);
  const [selectedAddress, setSelectedAddress] = useState<null | string>(null);
  const [ksaAddress, setKsaAddress] = useState<KsaNationalAddress | null>(null);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const resetFlowState = () => {
    // Fully reset the transient add-address flow so a reopened drawer starts fresh.
    setCurrentLocation(null);
    setGoogleAddressData(null);
    setIsManualEntryMode(false);
    setIsSelectedLocationInSaudiArabia(null);
    setKsaAddress(null);
    setSelectedAddress(null);
    setSelectedLocation(null);
    setShowSaveForm(false);
  };

  return (
    <AddDeliveryAddressContext.Provider
      value={{
        currentLocation,
        customerData,
        deliveryType,
        googleAddressData,
        initialContactData,
        initialSelectedLocation,
        isManualEntryMode,
        isSelectedLocationInSaudiArabia,
        ksaAddress,
        resetFlowState,
        selectedAddress,
        selectedLocation,
        setCurrentLocation,
        setGoogleAddressData,
        setIsManualEntryMode,
        setIsSelectedLocationInSaudiArabia,
        setKsaAddress,
        setSelectedAddress,
        setSelectedLocation,
        setShowSaveForm,
        showSaveForm,
      }}
    >
      {children}
    </AddDeliveryAddressContext.Provider>
  );
}

export function useAddDeliveryAddressContext() {
  const context = useContext(AddDeliveryAddressContext);
  if (!context) {
    throw new Error(
      "useAddDeliveryAddressContext must be used within AddDeliveryAddressContextProvider"
    );
  }
  return context;
}

export function useOptionalAddDeliveryAddressContext() {
  return useContext(AddDeliveryAddressContext);
}
