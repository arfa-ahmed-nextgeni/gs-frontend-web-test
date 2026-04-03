"use client";

import { Spinner } from "@/components/ui/spinner";
import useBodyScroll from "@/hooks/use-body-scroll";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

import { useSearch } from "../search-container";

export function MobileSearchDialogFallback() {
  const { showMobileSearch } = useSearch();

  useBodyScroll(showMobileSearch);

  if (!showMobileSearch) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/30 backdrop-blur-[2.50px]",
          ZIndexLevel.Dialog
        )}
      />
      <div
        className={cn(
          "bg-bg-default fixed inset-0 flex h-dvh w-full flex-col",
          ZIndexLevel.Dialog
        )}
        role="status"
      >
        <div className="mx-auto flex w-full flex-row gap-5 px-2.5 py-1.5">
          <div className="bg-bg-surface rounded-4xl h-11 flex-1" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Spinner variant="dark" />
        </div>
      </div>
    </>
  );
}
