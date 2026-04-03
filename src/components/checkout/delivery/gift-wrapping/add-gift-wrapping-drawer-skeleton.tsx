"use client";

import Image from "next/image";

import ShieldIcon from "@/assets/icons/Shield.svg";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { Skeleton } from "@/components/ui/skeleton";

export const AddGiftWrappingDrawerSkeleton = () => {
  return (
    <DrawerLayout
      contentContainerClassName="flex"
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
      showBackButton={false}
      showDesktopBackButton={false}
      title=""
      titleClassName="flex items-center"
    >
      <div className="scrollbar-hidden flex max-h-full flex-col gap-7 overflow-y-auto px-5 py-6">
        {/* Gift Sections Skeleton */}
        {[...Array(2)].map((_, sectionIndex) => (
          <div className="flex flex-col gap-3" key={sectionIndex}>
            {/* Section Title Skeleton */}
            <Skeleton className="h-4 w-32" />

            {/* Horizontal Scrollable Cards Skeleton */}
            <div className="scrollbar-hidden flex gap-3 overflow-x-auto pb-1">
              {[...Array(4)].map((_, cardIndex) => (
                <div
                  className="border-border-base bg-bg-default flex w-[140px] shrink-0 flex-col rounded-[10px] border shadow-[0px_1px_0px_0px_#f3f3f3]"
                  key={cardIndex}
                >
                  {/* Image Skeleton */}
                  <Skeleton className="h-[140px] w-full rounded-t-[10px]" />

                  {/* Content Skeleton */}
                  <div className="flex flex-1 flex-col gap-[10px] px-3 pb-5 pt-3">
                    {/* Name Skeleton */}
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-2/3" />

                    {/* Price Skeleton */}
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Message Section Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="min-h-[100px] w-full rounded-[10px]" />
        </div>

        {/* Standard Box and Button Section Skeleton */}
        <div className="flex flex-col gap-4 pb-8">
          {/* Standard Box Checkbox Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>

          {/* Info Text Skeleton */}
          <div className="flex items-start gap-3">
            <Skeleton className="mt-1.5 h-3 w-3 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-[50px] w-full rounded-[10px]" />
        </div>
      </div>
    </DrawerLayout>
  );
};
