"use client";

import { startTransition, useEffect } from "react";

import { syncDeviceIdCookie } from "@/lib/actions/cookies/device-id";
import { saveViewedProduct } from "@/lib/actions/products/save-viewed-product";
import { getClientDeviceId } from "@/lib/utils/device-id";

export function ViewedProductTracker({ productSku }: { productSku: string }) {
  useEffect(() => {
    let isCancelled = false;

    startTransition(async () => {
      if (isCancelled) {
        return;
      }

      const saveResult = await saveViewedProduct({
        productSku,
      });

      if (isCancelled || !saveResult.data.requiresDeviceSync) {
        return;
      }

      const deviceId = await getClientDeviceId();
      if (!deviceId || isCancelled) {
        return;
      }

      await syncDeviceIdCookie({
        deviceId,
      });
      if (isCancelled) {
        return;
      }

      await saveViewedProduct({
        productSku,
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [productSku]);

  return null;
}
