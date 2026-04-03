"use client";

import { startTransition, useEffect } from "react";

import { RecentlyViewedProductsSkeleton } from "@/components/product/recently-viewed-products/recently-viewed-products-skeleton";
import { syncDeviceIdCookie } from "@/lib/actions/cookies/device-id";
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

  return <RecentlyViewedProductsSkeleton maximumProducts={maximumProducts} />;
}
