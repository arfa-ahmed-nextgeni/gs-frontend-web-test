"use client";

import { lazy, type ReactNode, Suspense } from "react";

import Image from "next/image";

import BackIcon from "@/assets/icons/back-icon.svg";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouteMatch } from "@/hooks/use-route-match";

import type { MobileTopBarRouteProps } from "@/layouts/header/mobile-top-bar";

const MobileTopBar = lazy(() =>
  import("@/layouts/header/mobile-top-bar").then((module) => ({
    default: module.MobileTopBar,
  }))
);

function ProductRootMobileTopBarFallback() {
  return (
    <div aria-hidden="true" className="flex flex-1 flex-row justify-between">
      <div className="flex flex-row gap-2.5">
        <div className="flex h-full items-center justify-center px-2.5">
          <Image alt="" className="rtl:rotate-180" src={BackIcon} />
        </div>
        <div className="flex max-w-[55vw] flex-col justify-center gap-px">
          <div className="gap-1.25 flex flex-row items-center">
            <Skeleton className="w-12.5 h-4" />
            <Skeleton className="size-2.5" />
          </div>
          <Skeleton className="w-50 h-6" />
        </div>
      </div>

      <div className="gap-7.5 flex flex-row items-center pe-2.5">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="size-5 rounded-full" />
      </div>
    </div>
  );
}

export const DeferredMobileTopBar = ({
  fallback,
}: {
  fallback?: ReactNode;
}) => {
  const isMobile = useIsMobile();
  const {
    isAddAddress,
    isAddProductReview,
    isCategory,
    isCustomer,
    isHome,
    isOrderDetails,
    isProduct,
    isProductReviews,
    isProductRoot,
    isProfileRoot,
  } = useRouteMatch();

  const shouldRenderMobileTopBar =
    isMobile && !(!isCategory && !isCustomer && isHome);

  const routeProps: MobileTopBarRouteProps = {
    isAddAddress,
    isAddProductReview,
    isCategory,
    isCustomer,
    isOrderDetails,
    isProduct,
    isProductReviews,
    isProductRoot,
    isProfileRoot,
  };

  if (!shouldRenderMobileTopBar) {
    return fallback;
  }

  const mobileTopBarFallback = isProductRoot ? (
    <ProductRootMobileTopBarFallback />
  ) : (
    fallback
  );

  return (
    <Suspense fallback={mobileTopBarFallback}>
      <MobileTopBar {...routeProps} />
    </Suspense>
  );
};
