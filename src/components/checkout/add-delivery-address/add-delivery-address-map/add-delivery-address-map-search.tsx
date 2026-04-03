"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useTranslations } from "next-intl";

import SearchIcon from "@/assets/icons/search-icon.svg";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { extractGoogleAddressData } from "@/lib/utils/google-address";

export const AddDeliveryAddressMapSearch = () => {
  const t = useTranslations("AddDeliveryAddressPage.map");

  const { setGoogleAddressData, setSelectedAddress, setSelectedLocation } =
    useAddDeliveryAddressContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isServiceReady, setIsServiceReady] = useState(false);

  const placesLib = useMapsLibrary("places");
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    console.info("[AddressSearch] Places library status:", {
      autocompleteServiceReady: !!autocompleteService.current,
      isServiceReady,
      placesLib: !!placesLib,
      placesLibKeys: placesLib ? Object.keys(placesLib) : [],
      placesLibType: typeof placesLib,
    });

    if (!placesLib) {
      console.warn(
        "[AddressSearch] Places library not loaded. This could mean:",
        "1. API key is invalid or doesn't have Places API enabled",
        "2. Google Maps loading is still in progress",
        "3. Network error while loading Places library"
      );
      setIsServiceReady(false);
      return;
    }

    if (autocompleteService.current && placesService.current) {
      console.info("[AddressSearch] Services already initialized");
      setIsServiceReady(true);
      return;
    }

    try {
      console.info("[AddressSearch] Creating new Places API services...");
      console.info("[AddressSearch] Available in placesLib:", {
        hasAutoCompleteService: !!placesLib.AutocompleteService,
        hasPlacesService: !!placesLib.PlacesService,
      });

      if (!placesLib.AutocompleteService) {
        throw new Error(
          "AutocompleteService not available in places library. Check if Places API is enabled in Google Cloud Console."
        );
      }

      autocompleteService.current = new placesLib.AutocompleteService();
      // Create a dummy div for PlacesService (required by the API)
      const dummyDiv = document.createElement("div");
      placesService.current = new placesLib.PlacesService(dummyDiv);
      console.info(
        "[AddressSearch] Places API services initialized successfully"
      );
      setIsServiceReady(true);
    } catch (error) {
      console.error("[AddressSearch] Error initializing Places services:", {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        placesLibKeys: placesLib ? Object.keys(placesLib) : [],
      });
      setIsServiceReady(false);
    }
  }, [placesLib, isServiceReady]);

  const fetchSuggestions = useCallback(
    (query: string) => {
      console.info(
        "[AddressSearch] fetchSuggestions called with query:",
        query,
        {
          hasAutocompleteService: !!autocompleteService.current,
          isServiceReady,
        }
      );

      if (!isServiceReady || !autocompleteService.current) {
        console.warn(
          "[AddressSearch] AutocompleteService not initialized.",
          "isServiceReady:",
          isServiceReady,
          "service exists:",
          !!autocompleteService.current
        );
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      if (query.length < 2) {
        console.info("[AddressSearch] Query too short, skipping fetch");
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const request = {
        // Add region biasing for better results (adjust based on your target region)
        componentRestrictions: { country: ["ae", "sa", "kw", "om"] }, // GCC countries
        input: query,
      };

      console.info("[AddressSearch] Making Places API request:", request);

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          console.info("[AddressSearch] Places API response:", {
            predictions: predictions,
            predictionsCount: predictions?.length || 0,
            status: status,
            statusName: Object.keys(
              google.maps.places.PlacesServiceStatus
            ).find(
              (key) =>
                google.maps.places.PlacesServiceStatus[
                  key as keyof typeof google.maps.places.PlacesServiceStatus
                ] === status
            ),
          });

          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            console.info(
              `[AddressSearch] Successfully got ${predictions.length} predictions`
            );
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else if (
            status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
          ) {
            console.info("[AddressSearch] No results found for query");
            setSuggestions([]);
            setShowSuggestions(false);
          } else {
            console.error("[AddressSearch] Places API error:", status);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    },
    [isServiceReady]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.info("[AddressSearch] Input changed:", value);
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      console.info(
        "[AddressSearch] Suggestion clicked:",
        prediction.description
      );

      if (!placesService.current) {
        console.error("[AddressSearch] PlacesService not available");
        return;
      }

      const request = {
        fields: ["address_components", "name", "geometry", "formatted_address"],
        placeId: prediction.place_id,
      };

      console.info(
        "[AddressSearch] Getting place details for placeId:",
        request
      );

      placesService.current.getDetails(request, (place, status) => {
        console.info("[AddressSearch] Place details response:", {
          hasPlace: !!place,
          place: place,
          status: status,
          statusName: Object.keys(google.maps.places.PlacesServiceStatus).find(
            (key) =>
              google.maps.places.PlacesServiceStatus[
                key as keyof typeof google.maps.places.PlacesServiceStatus
              ] === status
          ),
        });

        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry?.location
        ) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          const address = place.formatted_address || prediction.description;

          console.info("[AddressSearch] Setting address and location:", {
            address,
            location,
          });

          setSearchQuery(address);
          setSuggestions([]);
          setShowSuggestions(false);
          setIsSearchFocused(false);

          // Update context with selected address and location
          setGoogleAddressData(
            extractGoogleAddressData({
              addressComponents: place.address_components,
              formattedAddress: address,
            })
          );
          setSelectedAddress(address);
          setSelectedLocation(location);
        } else {
          console.error("[AddressSearch] Error getting place details:", status);
        }
      });
    },
    [setGoogleAddressData, setSelectedAddress, setSelectedLocation]
  );

  const handleFocus = () => {
    console.info("[AddressSearch] Input focused, searchQuery:", searchQuery);
    setIsSearchFocused(true);
    if (searchQuery.length >= 2) {
      fetchSuggestions(searchQuery);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="pointer-events-none absolute top-2.5 z-10 flex w-full justify-center">
      <div className="w-9/10 pointer-events-auto relative">
        <span className="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center ps-3 sm:ps-5">
          <Image
            alt="search"
            className="size-4 sm:size-5"
            height={20}
            src={SearchIcon}
            width={20}
          />
        </span>
        <input
          className="bg-bg-default text-text-primary placeholder:text-text-placeholder sm:ps-15 py-2.25 block w-full rounded-3xl border-none pe-5 ps-11 text-sm font-normal shadow-sm focus:outline-none sm:text-base"
          onBlur={handleBlur}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={t("searchAddress")}
          type="text"
          value={searchQuery}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="pointer-events-auto absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl bg-white shadow-lg">
            {suggestions.map((prediction) => (
              <button
                className="w-full border-b border-gray-100 px-4 py-3 text-left first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 hover:bg-gray-50 rtl:text-right"
                key={prediction.place_id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(prediction);
                }}
                type="button"
              >
                <div className="text-sm font-medium text-gray-900">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No suggestions message */}
        {isSearchFocused &&
          searchQuery.length >= 2 &&
          suggestions.length === 0 && (
            <div className="pointer-events-auto absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl bg-white shadow-lg">
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500 rtl:text-right">
                  {!placesLib
                    ? "Loading search... (Places API initializing)"
                    : !isServiceReady
                      ? "Initializing search service..."
                      : "No addresses found. Try a different search term."}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
