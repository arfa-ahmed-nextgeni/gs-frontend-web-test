import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailsSkeleton = () => {
  return (
    <div className="col-span-6 flex flex-col gap-5 px-2.5 lg:col-span-5 lg:px-0">
      <div className="flex flex-col">
        <div className="hidden flex-col lg:flex">
          <div className="gap-1.25 flex flex-row items-center">
            <Skeleton className="w-12.5 h-3.5" />
            <Skeleton className="size-2.5" />
          </div>
          <div className="mt-2 flex flex-row items-start gap-2.5">
            <Skeleton className="w-70 h-7" />
            <Skeleton className="size-3.5" />
          </div>
          <div className="mt-4 flex flex-row gap-5">
            <Skeleton className="w-18.5 h-2.5" />
            <Skeleton className="w-11.5 h-2.5" />
            <Skeleton className="w-19 h-2.5" />
          </div>
        </div>
        <Skeleton className="h-7.5 w-12.5 lg:mt-9" />

        <div className="gap-1.25 mt-3 flex flex-col lg:mt-4">
          <div className="gap-1.25 flex flex-row flex-wrap">
            <Skeleton className="h-6.25 w-38" />
            <Skeleton className="h-6.25 w-38" />
          </div>

          <div className="gap-1.25 flex flex-row flex-wrap">
            <Skeleton className="h-6.25 w-38" />
            <Skeleton className="h-6.25 w-20" />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 lg:mt-10">
          <div className="flex flex-wrap gap-2.5 overflow-x-auto">
            {[...Array(3)].map((_, index) => (
              <Skeleton
                className="max-w-22.75 h-15 border-border-base bg-bg-default flex w-[21.1vw] flex-shrink-0 flex-col items-center justify-center gap-2 rounded-[10px] border"
                key={index}
              />
            ))}
          </div>
          <div className="bg-bg-surface min-h-15 flex w-max flex-row rounded-xl py-2.5">
            {[...Array(4)].map((_, index) => (
              <React.Fragment key={index}>
                <div className="max-w-24.25 flex w-[22.5vw] flex-col items-center justify-start gap-1">
                  <Skeleton className="h-4 w-11" />
                  <Skeleton className="w-12.5 h-5" />
                </div>
                {index !== 4 && (
                  <span className="w-0.25 border-border-light-gray my-auto h-4/5 border" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="hidden flex-row gap-5 lg:flex">
          <div className="transition-default h-12.5 bg-btn-bg-teal hover:bg-btn-bg-mint flex flex-1 items-center justify-center rounded-xl">
            <Skeleton className="w-27.5 h-5" />
          </div>
          <Skeleton className="size-12.5" />
        </div>
      </div>
    </div>
  );
};
