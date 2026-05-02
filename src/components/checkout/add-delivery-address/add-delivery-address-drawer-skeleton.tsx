"use client";

import Image from "next/image";

import ShieldIcon from "@/assets/icons/Shield.svg";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { Skeleton } from "@/components/ui/skeleton";

export const AddDeliveryAddressDrawerSkeleton = () => {
  return (
    <DrawerLayout
      contentContainerClassName="flex flex-col"
      mobileHeaderEndContent={
        <Image
          alt="shield"
          className="size-5"
          height={20}
          src={ShieldIcon}
          width={20}
        />
      }
      onBack={() => {}}
      onClose={() => {}}
      showBackButton
      showDesktopBackButton
      title=""
    >
      {/* Map area skeleton */}
      <div className="relative flex-1">
        <Skeleton className="h-full w-full rounded-none" />

        {/* Search bar overlay skeleton */}
        <div className="absolute left-4 right-4 top-4">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>

      {/* Bottom sheet / form area skeleton */}
      <div className="flex flex-col gap-4 bg-white px-5 py-6">
        {/* Address line skeleton */}
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        {/* Confirm button skeleton */}
        <Skeleton className="h-12.5 w-full rounded-xl" />
      </div>
    </DrawerLayout>
  );
};
