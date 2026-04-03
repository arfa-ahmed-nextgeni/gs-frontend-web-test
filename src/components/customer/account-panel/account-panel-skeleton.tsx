import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const AccountPanelSkeleton = ({
  containerProps,
}: {
  containerProps?: ComponentProps<"div">;
}) => {
  return (
    <div
      {...containerProps}
      className={cn(
        "lg:w-98.25 lg:mt-12.5 mt-2.5 flex flex-col gap-2.5",
        containerProps?.className
      )}
    >
      <div className="bg-bg-default gap-7.5 mx-5 flex animate-pulse flex-col rounded-xl p-5 lg:mx-0">
        <div className="flex flex-row items-center justify-between">
          <span className="h-7 w-28 rounded bg-gray-200" />
          <span className="w-25 h-4 rounded bg-gray-200" />
        </div>
        <div className="flex flex-row items-center gap-2.5">
          <div className="bg-btn-bg-warning rounded-4xl flex h-12 w-fit flex-row items-center gap-5 px-5">
            <span className="w-25 h-4 rounded bg-gray-200" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="h-3 w-40 rounded bg-gray-200" />
            <span className="w-25 h-3 rounded bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden lg:rounded-xl">
        {[...Array(6)].map((_, index) => (
          <div
            className="border-border-base h-12.5 bg-bg-default flex flex-row items-center justify-between border-b px-5"
            key={index}
          >
            <div className="flex flex-row items-center gap-5">
              <span className="size-5 rounded bg-gray-200" />
              <span className="w-45 h-3 rounded bg-gray-200" />
            </div>
            <span className="h-6 w-3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
};
