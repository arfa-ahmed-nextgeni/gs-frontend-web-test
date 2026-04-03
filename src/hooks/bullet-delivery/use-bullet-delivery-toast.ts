import { useEffect, useEffectEvent, useRef } from "react";

import { toast } from "@/components/ui/sonner";

/**
 * Hook to show toast notification when bullet delivery becomes enabled
 * Shows toast once when eligibility becomes true
 * If cart item count increases, waits 3 seconds before showing the toast
 */
export function useBulletDeliveryToast({
  bannerText,
  cartItemCount,
  shouldShowBanner,
}: {
  bannerText: string;
  cartItemCount?: number;
  shouldShowBanner: boolean;
}) {
  const hasShownRef = useRef<boolean>(false);
  const previousItemCountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use useEffectEvent to access latest bannerText without including it in dependencies
  const showToast = useEffectEvent(() => {
    toast({
      description: "",
      duration: 4000,
      position: "top",
      title: bannerText,
      type: "bullet",
    });
    hasShownRef.current = true;
  });

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const currentItemCount = cartItemCount ?? 0;
    const itemCountIncreased = currentItemCount > previousItemCountRef.current;

    if (shouldShowBanner && !hasShownRef.current) {
      if (itemCountIncreased) {
        // Wait 3 seconds if cart item count increased
        timeoutRef.current = setTimeout(() => {
          showToast();
        }, 3000);
      } else {
        // Show immediately if not triggered by item count increase
        showToast();
      }
    }

    // Update previous item count
    previousItemCountRef.current = currentItemCount;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      hasShownRef.current = false;
    };
  }, [cartItemCount, shouldShowBanner]);
}
