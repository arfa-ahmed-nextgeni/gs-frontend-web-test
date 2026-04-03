"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import { useScrollToTop } from "@/components/checkout/add-pickup-point/hooks/use-scroll-to-top";
import { useTrackEmptySearchResults } from "@/components/checkout/add-pickup-point/hooks/use-track-empty-search-results";
import { AddPickupPointLocationSelectionSkeleton } from "@/components/checkout/add-pickup-point/skeletons/add-pickup-point-location-selection-skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";
import { useLockerLocations } from "@/hooks/queries/use-locker-locations";
import {
  trackSelectFodelPointFromList,
  trackSelectRedboxPointFromList,
  trackUseThisLocationFodel,
  trackUseThisLocationRedbox,
} from "@/lib/analytics/events";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { cn } from "@/lib/utils";

export const AddPickupPointLocationSelection = () => {
  const t = useTranslations("AddPickupPointPage");

  const {
    currentLocation,
    currentStep,
    lockerType,
    nextStep,
    searchQuery,
    selectedLockerId,
    setSearchQuery,
    setSelectedLockerId,
  } = useAddPickupPointContext();

  const scrollContainerRef = useScrollToTop(currentStep);

  const { data: lockerLocations = [], isLoading } = useLockerLocations(
    currentLocation
      ? {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          type: lockerType,
        }
      : null
  );

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

  // Format distance: convert to km if > 1000m for Redbox, otherwise show in meters
  // Fodel distance is already in km from API
  const formatDistance = useCallback(
    (distance: number) => {
      // For Fodel, distance is already in km from API
      if (lockerType === LockerType.Fodel) {
        return t("distance", {
          distance: `${Math.round(distance * 10) / 10}`,
        });
      }
      // For Redbox, distance is in meters. Convert to km if > 1000m
      if (distance > 1000) {
        const distanceInKm = Math.round((distance / 1000) * 10) / 10;
        return t("distance", {
          distance: `${distanceInKm}`,
        });
      }
      // Show in meters for Redbox distances <= 1000m
      return t("distanceMeters", {
        distance: `${Math.round(distance)}`,
      });
    },
    [lockerType, t]
  );

  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll accordion to top of container when expanded or selected
  const scrollAccordionToTop = useCallback(
    (lockerId: string) => {
      const accordionElement = accordionRefs.current[lockerId];
      if (accordionElement && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        // Calculate the position relative to the scroll container
        const containerRect = container.getBoundingClientRect();
        const accordionRect = accordionElement.getBoundingClientRect();
        const relativeTop =
          accordionRect.top - containerRect.top + container.scrollTop;

        // Get maximum scroll position
        const maxScrollTop = container.scrollHeight - container.clientHeight;

        // Scroll to position the accordion at the top of the container
        // If accordion is near bottom, scroll as much as possible
        const finalScrollTop = Math.min(relativeTop, maxScrollTop);

        container.scrollTo({
          behavior: "smooth",
          top: Math.max(0, finalScrollTop),
        });
      }
    },
    [scrollContainerRef]
  );

  useEffect(() => {
    if (selectedLockerId) {
      // Delay to ensure accordion content is fully rendered and expanded
      // Use requestAnimationFrame to wait for browser to render the expanded accordion
      // Longer delay for last accordions that need more time to expand
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollAccordionToTop(selectedLockerId);
          });
        });
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedLockerId, scrollAccordionToTop]);

  // Track empty search results when search query exists but no results
  useTrackEmptySearchResults(
    searchQuery,
    filteredLockerLocations.length,
    isLoading,
    lockerType
  );

  if (isLoading) {
    return <AddPickupPointLocationSelectionSkeleton />;
  }

  if (filteredLockerLocations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-secondary text-sm">
          {t("noLockerLocationsFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-5"
        ref={scrollContainerRef}
      >
        <p className="text-text-secondary text-sm font-medium">
          {lockerType === LockerType.Fodel
            ? t("selectPickUpLocation")
            : t("lockerLocations")}
        </p>
        <Accordion
          collapsible
          onValueChange={(value) => {
            setSelectedLockerId(value || null);
            // Track list selection when a point is selected from the list
            if (value) {
              if (lockerType === LockerType.Fodel) {
                trackSelectFodelPointFromList();
              } else if (lockerType === LockerType.Redbox) {
                trackSelectRedboxPointFromList();
              }
              // Scroll accordion to top when it opens
              // Use requestAnimationFrame to wait for browser to render the expanded accordion
              // Longer delay for last accordions that need more time to expand
              setTimeout(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    scrollAccordionToTop(value);
                  });
                });
              }, 200);
            }
          }}
          type="single"
          value={selectedLockerId || ""}
        >
          {filteredLockerLocations.map((locker) => (
            <AccordionItem
              className="border-border-base transition-default bg-bg-default data-[state=open]:bg-bg-surface first:rounded-t-xl last:rounded-b-xl"
              key={locker.id}
              ref={(el) => {
                accordionRefs.current[locker.id] = el;
              }}
              value={locker.id}
            >
              <AccordionTrigger className="min-h-11.25 group flex items-center justify-between px-5 hover:no-underline group-data-[state=open]:h-auto [&>svg]:hidden">
                <p className="text-text-primary line-clamp-1 w-2/3 text-start text-sm font-medium group-data-[state=open]:line-clamp-none">
                  {locker.name}
                </p>
                <div className="flex flex-shrink-0 flex-row items-center justify-end gap-5">
                  <p className="text-text-tertiary text-xs font-normal">
                    {formatDistance(locker.distance)}
                  </p>
                  <Image
                    alt="arrow down"
                    className="transition-default h-2.5 w-5 flex-shrink-0 group-data-[state=open]:rotate-180"
                    height={10}
                    src={ArrowDownIcon}
                    width={20}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-5 p-5">
                <div className="flex flex-col gap-2">
                  <p className="text-text-tertiary text-xs font-normal">
                    {t("lockerLocation")}
                  </p>
                  <p className="text-text-primary text-sm font-medium">
                    {locker.address}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-text-tertiary text-xs font-normal">
                    {t("operatingHours")}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {locker.operatingHours.map((hours, index) => (
                      <p
                        className="text-text-primary text-sm font-medium"
                        key={index}
                      >
                        {hours}
                      </p>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {selectedLockerId && (
        <div className="border-border-base bg-bg-default flex-shrink-0 border-t px-5 pb-5 pt-2.5 lg:pb-2.5">
          <button
            className={cn(
              "transition-default bg-btn-bg-primary text-text-ghost h-12.5 w-full rounded-xl text-xl font-medium",
              "hover:bg-btn-bg-slate",
              "focus:bg-btn-bg-primary focus:outline-none"
            )}
            onClick={() => {
              // Track use_this_location when "use this location" button is clicked
              if (lockerType === LockerType.Fodel) {
                trackUseThisLocationFodel();
              } else if (lockerType === LockerType.Redbox) {
                trackUseThisLocationRedbox();
              }
              setSearchQuery("");
              setSelectedLockerId(selectedLockerId);
              nextStep();
            }}
          >
            {t("selectLockerButton")}
          </button>
        </div>
      )}
    </div>
  );
};
