"use client";

import type { ReactNode } from "react";

import { useRouteMatch } from "@/hooks/use-route-match";
import {
  MobileTopBar,
  type MobileTopBarRouteProps,
} from "@/layouts/header/mobile-top-bar";

export const DeferredMobileTopBar = ({
  fallback,
}: {
  fallback?: ReactNode;
}) => {
  const {
    isAddAddress,
    isAddProductReview,
    isCategory,
    isCustomer,
    isHome,
    isMenu,
    isOrderDetails,
    isProduct,
    isProductReviews,
    isProductRoot,
    isProfileRoot,
    isSearch,
    isTrackOrder,
  } = useRouteMatch();

  const shouldRenderMobileTopBar =
    !isMenu && !(!isCategory && !isCustomer && isHome);

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
    isSearch,
    isTrackOrder,
  };

  if (!shouldRenderMobileTopBar) {
    return fallback;
  }

  return <MobileTopBar {...routeProps} />;
};
