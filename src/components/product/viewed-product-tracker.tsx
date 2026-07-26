"use client";

import { startTransition, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { syncDeviceIdCookie } from "@/lib/actions/cookies/device-id";
import { saveViewedProduct } from "@/lib/actions/products/save-viewed-product";
import { type Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { getClientDeviceId } from "@/lib/utils/device-id";

export function ViewedProductTracker({ productSku }: { productSku: string }) {
  const locale = useLocale() as Locale;
  const queryClient = useQueryClient();

  useEffect(() => {
    startTransition(async () => {
      let saveResult = await saveViewedProduct({
        productSku,
      });

      if (saveResult.data.requiresDeviceSync) {
        const deviceId = await getClientDeviceId();
        if (!deviceId) {
          return;
        }

        await syncDeviceIdCookie({
          deviceId,
          shouldRefresh: false,
        });

        saveResult = await saveViewedProduct({
          productSku,
        });
      }

      if (saveResult.data.saved) {
        await queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.PRODUCTS.RECENTLY_VIEWED, locale],
          refetchType: "all",
        });
      }
    });
  }, [locale, productSku, queryClient]);

  return null;
}
