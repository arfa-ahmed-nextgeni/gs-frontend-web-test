"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useLocale, useTranslations } from "next-intl";

import SearchIcon from "@/assets/icons/search-icon.svg";
import { useAddDeliveryAddressContext } from "@/contexts/add-delivery-address-context";
import { extractGoogleAddressData } from "@/lib/utils/google-address";
import { getLocaleInfo } from "@/lib/utils/locale";

export const AddDeliveryAddressMapSearch = () => {
  const locale = useLocale();
  const SEARCH_DEBOUNCE_MS = 300;
  const t = useTranslations("AddDeliveryAddressPage.map");
  const { language: googleMapsLanguage } = getLocaleInfo(locale);

  const {
    mapSearchResetKey,
    setGoogleAddressData,
    setIsSelectedLocationInSaudiArabia,
    setSelectedAddress,
    setSelectedLocation,
  } = useAddDeliveryAddressContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isServiceReady, setIsServiceReady] = useState(false);

  // Clear search state whenever the flow is reset (e.g. drawer close)
  useEffect(() => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSearchFocused(false);
  }, [mapSearchResetKey]);

  const placesLib = useMapsLibrary("places");
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep results open while interacting with or scrolling the dropdown.
    // Close only when the pointer starts outside the search container.
    const handlePointerDown = (event: PointerEvent) => {
      if (searchContainerRef.current?.contains(event.target as Node)) {
        return;
      }

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      setIsSearchFocused(false);
      setShowSuggestions(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    // Remove the global listener when the map search component unmounts.
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!placesLib) {
      setIsServiceReady(false);
      return;
    }

    if (autocompleteService.current && placesService.current) {
      setIsServiceReady(true);
      return;
    }

    try {
      if (!placesLib.AutocompleteService) {
        throw new Error(
          "AutocompleteService not available in places library. Check if Places API is enabled in Google Cloud Console."
        );
      }

      autocompleteService.current = new placesLib.AutocompleteService();
      // Create a dummy div for PlacesService (required by the API)
      const dummyDiv = document.createElement("div");
      placesService.current = new placesLib.PlacesService(dummyDiv);
      setIsServiceReady(true);
    } catch {
      setIsServiceReady(false);
    }
  }, [placesLib, isServiceReady]);

  const fetchSuggestions = useCallback(
    (query: string) => {
      if (!isServiceReady || !autocompleteService.current) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const request = {
        // Add region biasing for better results (adjust based on your target region)
        componentRestrictions: { country: ["ae", "sa", "kw", "om"] }, // GCC countries
        input: query,
        language: googleMapsLanguage,
        region: "SA",
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    },
    [googleMapsLanguage, isServiceReady]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSuggestionClick = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      // Immediately close suggestions and defocus so the searchQuery change
      // triggered by the async getDetails callback does not re-fire the fetch.
      setShowSuggestions(false);
      setSuggestions([]);
      setIsSearchFocused(false);
      inputRef.current?.blur();

      if (!placesService.current) {
        return;
      }

      const request = {
        fields: ["address_components", "name", "geometry", "formatted_address"],
        language: googleMapsLanguage,
        placeId: prediction.place_id,
        region: "SA",
      };

      placesService.current.getDetails(request, (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry?.location
        ) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          const googleAddressData = extractGoogleAddressData({
            addressComponents: place.address_components,
            formattedAddress: place.formatted_address || prediction.description,
            preferEnglish: googleMapsLanguage === "en",
          });
          const address =
            googleAddressData.formattedAddress ||
            place.formatted_address ||
            prediction.description;

          // Show "Place Name, address" in the search field when a name is
          // available (e.g. "Riyadh Park, Northern Ring Branch Road, Riyadh").
          const placeName =
            place.name || prediction.structured_formatting?.main_text;
          const displayName = placeName ? `${placeName}, ${address}` : address;

          setSearchQuery(displayName);
          setSuggestions([]);
          setShowSuggestions(false);

          const countryComponent = place.address_components?.find(({ types }) =>
            types.includes("country")
          );

          // Update context with selected address and location
          setGoogleAddressData(googleAddressData);
          setIsSelectedLocationInSaudiArabia(
            countryComponent?.short_name === "SA"
          );
          setSelectedAddress(address);
          setSelectedLocation(location);
        }
      });
    },
    [
      googleMapsLanguage,
      setGoogleAddressData,
      setIsSelectedLocationInSaudiArabia,
      setSelectedAddress,
      setSelectedLocation,
    ]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      }
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      !nextFocusedElement ||
      searchContainerRef.current?.contains(nextFocusedElement)
    ) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    setIsSearchFocused(false);
    setShowSuggestions(false);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSearchFocused) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce autocomplete calls so we do not hit Places on every keystroke.
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [fetchSuggestions, isSearchFocused, searchQuery]);

  return (
    <div className="pointer-events-none absolute top-2.5 z-10 flex w-full justify-center">
      <div
        className="w-9/10 pointer-events-auto relative"
        onBlur={handleBlur}
        ref={searchContainerRef}
      >
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
          className="bg-bg-default text-text-primary placeholder:text-text-placeholder sm:ps-15 py-2.25 block w-full rounded-3xl border-none pe-5 ps-11 text-base font-normal shadow-sm focus:outline-none"
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={t("searchAddress")}
          ref={inputRef}
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
                    ? t("loadingSearch")
                    : !isServiceReady
                      ? t("initializingSearchService")
                      : t("noAddressesFound")}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
