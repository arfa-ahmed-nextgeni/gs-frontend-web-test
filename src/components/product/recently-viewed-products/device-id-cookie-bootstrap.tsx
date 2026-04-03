"use client";

import { startTransition, useEffect } from "react";

import { CategoryProductsCarouselSkeleton } from "@/components/product/category-products-carousel-skeleton";
import { syncDeviceIdCookie } from "@/lib/actions/cookies/device-id";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { getClientDeviceId } from "@/lib/utils/device-id";

export function DeviceIdCookieBootstrap({
  maximumProducts,
}: {
  maximumProducts: number;
}) {
  useEffect(() => {
    let isCancelled = false;

    startTransition(async () => {
      const deviceId = await getClientDeviceId();

      if (!deviceId || isCancelled) {
        return;
      }

      await syncDeviceIdCookie({
        deviceId,
        shouldRefresh: false,
      });
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <CategoryProductsCarouselSkeleton
      maximumProducts={maximumProducts}
      variant={ProductCardVariant.Single}
    />
  );
}
