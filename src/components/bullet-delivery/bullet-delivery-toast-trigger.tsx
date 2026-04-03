"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useBulletDeliveryToast } from "@/hooks/bullet-delivery/use-bullet-delivery-toast";
import { useThrottledNow } from "@/hooks/use-throttled-now";
import {
  isBulletCutoffTimePassed,
  isBulletEnabledFromStores,
  isCartBulletEligible,
} from "@/lib/utils/bullet-delivery/eligibility";

/**
 * Component that triggers bullet delivery toast notification
 * when cart becomes eligible for bullet delivery
 * Can be used in cart or checkout pages
 */
export const BulletDeliveryToastTrigger = () => {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const t = useTranslations("ProductPage.badges.bulletDelivery");

  const now = useThrottledNow(1000);

  const bulletConfig = storeConfig?.bulletDeliveryConfig;

  // Check eligibility
  const isEnabled = isBulletEnabledFromStores(storeConfig);
  const isEligible = isCartBulletEligible(cart);
  const cutoffPassed = useMemo(
    () => isBulletCutoffTimePassed(bulletConfig, now),
    [bulletConfig, now]
  );

  // Don't show toast if cart is empty
  const isCartEmpty = !cart?.items || cart.items.length === 0;

  const shouldShowBanner =
    !isCartEmpty && isEnabled && isEligible && !cutoffPassed && !!bulletConfig;

  const cartBannerText = bulletConfig?.cartBannerText;

  // Use cartBannerText from store config, fallback to message
  const bannerText = cartBannerText || t("3hourDelivery");

  // Calculate cart item count from API (number of items, excluding GWP items)
  const cartItemCount = useMemo(() => {
    if (!cart) return 0;
    // Use totalItemCount from API and subtract GWP items count
    const gwpItemCount = cart.items.filter((item) => item.isGwp).length;
    return Math.max(0, (cart.totalItemCount || 0) - gwpItemCount);
  }, [cart]);

  // Show toast when bullet delivery becomes enabled
  useBulletDeliveryToast({
    bannerText,
    cartItemCount,
    shouldShowBanner,
  });

  // This component doesn't render anything, it only triggers the toast
  return null;
};
