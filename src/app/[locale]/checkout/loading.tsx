"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "@/i18n/navigation";

export default function CheckoutPageLoading() {
  const pathname = usePathname();

  // Don't show loading for drawer routes (add-gift-wrapping, add-pickup-point)
  if (
    pathname?.includes("/add-gift-wrapping") ||
    pathname?.includes("/add-pickup-point")
  ) {
    return null;
  }

  return (
    <>
      {/* Header Skeleton */}
      {/* Mobile Header */}
      <div className="mb-5 flex h-[50px] items-center justify-between bg-white px-4 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>

      {/* Desktop Header */}
      <div className="bg-bg-default px-30 mb-5 hidden h-[70px] grid-cols-[1fr_auto_1fr] items-center py-4 lg:grid">
        <div className="flex items-center">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="text-center">
          <Skeleton className="mx-auto h-6 w-40" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-32 lg:pb-24">
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="flex flex-col gap-3.5 lg:w-[800px] lg:gap-5">
            {/* Edit Bag Link Skeleton */}
            <div className="mb-2.5 hidden lg:block">
              <Skeleton className="h-5 w-24" />
            </div>

            {/* Shipping Address Section Skeleton */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            {/* Delivery Section Skeleton */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, index) => (
                  <div
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                    key={index}
                  >
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Payment Methods Skeleton */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, index) => (
                  <div
                    className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
                    key={index}
                  >
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2.5">
            {/* Discounts Section Skeleton */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>

            {/* Order Summary Skeleton */}
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {/* Product Items */}
                {[...Array(2)].map((_, index) => (
                  <div className="flex gap-3" key={index}>
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Skeleton */}
      <div className="bg-bg-default border-t-border-base fixed bottom-0 left-0 right-0 z-50 border-t p-4 lg:hidden">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </>
  );
}
