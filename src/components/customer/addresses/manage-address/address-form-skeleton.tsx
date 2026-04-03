import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export const AddressFormSkeleton = () => {
  return (
    <div className="flex flex-1 overflow-y-auto py-5">
      <div className="flex flex-1 flex-col justify-between px-5">
        <div className="flex flex-col gap-5">
          <div className="text-text-secondary flex flex-row gap-2 text-sm font-medium">
            {[...Array(2)].map((_, index) => (
              <React.Fragment key={index}>
                {index > 0 && " / "}
                <Skeleton className="h-5 w-10" />
              </React.Fragment>
            ))}
          </div>
          <div className="gap-1.25 flex flex-wrap items-center">
            {[...Array(2)].map((_, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-text-tertiary text-lg font-normal">
                    /
                  </span>
                )}
                <div className="h-12.5 bg-bg-default w-25 flex items-center justify-center rounded-xl px-5 text-lg font-normal">
                  <Skeleton className="h-5 w-full" />
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="col-span-2 mt-5 grid grid-cols-2 gap-x-2.5 gap-y-6">
            <Skeleton className="h-12.5 w-full" />
            <Skeleton className="h-12.5 w-full" />
            <Skeleton className="h-12.5 col-span-2 w-full" />
            <Skeleton className="h-12.5 col-span-2 w-full" />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 py-1.5">
            <Skeleton className="size-4" />
            <Skeleton className="w-38 h-5" />
          </div>
          <div className="h-12.5 bg-btn-bg-primary flex w-full items-center justify-center rounded-xl">
            <Skeleton className="w-34 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
