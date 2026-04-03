import { useEffect, useEffectEvent, useMemo, useRef } from "react";

import { useCheckoutContext } from "@/contexts/checkout-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useIsReturningFromPaymentError } from "@/hooks/checkout/use-is-returning-from-payment-error";
import { useRouteMatch } from "@/hooks/use-route-match";
import { useThrottledNow } from "@/hooks/use-throttled-now";
import {
  isBulletCutoffTimePassed,
  isBulletDeliveryVisible,
} from "@/lib/utils/bullet-delivery/eligibility";

import type { DeliveryMethod } from "@/components/checkout/delivery/delivery-methods/types";

interface BulletDeliveryState {
  bulletMethod: DeliveryMethod | undefined;
  cutoffPassed: boolean;
  isBulletInArray: boolean;
  isBulletSelected: boolean;
  isEligible: boolean;
}

interface UseBulletDeliveryMonitorOptions {
  isLoading?: boolean;
  methods: DeliveryMethod[];
  onMethodChange: (methodId: string) => void;
  onShowEligibleToast: (bulletMethod: DeliveryMethod) => void;
  onShowIneligibleToast: (message: string, type?: "info" | "warning") => void;
  selectedMethod: string;
}

/**
 * Custom hook to monitor bullet delivery state transitions
 * Handles toast notifications and auto-selection of standard delivery
 */
export function useBulletDeliveryMonitor({
  isLoading = false,
  methods,
  onMethodChange,
  onShowEligibleToast,
  onShowIneligibleToast,
  selectedMethod,
}: UseBulletDeliveryMonitorOptions) {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const { selectedLockerAddressType } = useCheckoutContext();
  const now = useThrottledNow(1000);

  const { isCheckoutAddGiftWrapping } = useRouteMatch();

  const isReturningFromPaymentError = useIsReturningFromPaymentError();

  // Track previous state for transition detection
  const prevStateRef = useRef<BulletDeliveryState | null>(null);
  const prevSelectedMethodRef = useRef<string>("");
  const prevMethodsRef = useRef<DeliveryMethod[]>([]);
  const prevIsLoadingRef = useRef<boolean>(isLoading);
  const lastHandledIneligibleMethodRef = useRef<string>("");
  const hasShownEligibleToastRef = useRef(false);
  const hasShownIneligibleToastRef = useRef(false);
  const hasHandledBulletDisappearanceRef = useRef(false);
  const isInitialMountRef = useRef(true);
  // Track selected method before address change (to detect when method was reset due to address change)
  const selectedMethodBeforeAddressChangeRef = useRef<string>("");
  // Track cart's selected method before address change (source of truth)
  const cartMethodBeforeAddressChangeRef = useRef<null | string>(null);
  // Track shipping address city to detect address changes even when methods array doesn't change
  const prevShippingCityRef = useRef<null | string>(null);
  // Track if we've already reset the flag for the current address change
  const hasResetFlagForMethodResetRef = useRef(false);

  // Extract bullet delivery method
  const bulletMethod = useMemo(
    () =>
      methods.find(
        (method) =>
          method.id?.toLowerCase().includes("express") ||
          method.carrier_code?.toLowerCase().includes("express")
      ),
    [methods]
  );

  // Compute current state
  const currentState = useMemo<BulletDeliveryState>(() => {
    const isBulletInArray = !!bulletMethod;
    const isBulletSelected = selectedMethod === bulletMethod?.id;
    // For checkout page, skip cutOffTime check and use city time window instead
    const isEligible = bulletMethod
      ? isBulletDeliveryVisible(cart, storeConfig, now, {
          skipCutoffTimeCheck: true,
        })
      : false;
    // Still check cutoffPassed for toast message purposes
    const cutoffPassed = isBulletCutoffTimePassed(
      storeConfig?.bulletDeliveryConfig,
      now
    );

    return {
      bulletMethod,
      cutoffPassed,
      isBulletInArray,
      isBulletSelected,
      isEligible,
    };
  }, [bulletMethod, cart, now, selectedMethod, storeConfig]);

  // Find standard delivery method
  const findStandardMethod = useEffectEvent(() => {
    return methods.find(
      (method) =>
        method.id?.toLowerCase().includes("flatrate") ||
        method.id?.toLowerCase().includes("flat_rate") ||
        method.carrier_code?.toLowerCase().includes("flatrate")
    );
  });

  // Check if method is bullet delivery
  const isBulletMethod = useEffectEvent((methodId: string) => {
    if (!methodId) return false;
    return (
      methodId.toLowerCase().includes("express") ||
      methods
        .find((m) => m.id === methodId)
        ?.carrier_code?.toLowerCase()
        .includes("express") === true
    );
  });

  // Get the actual selected method from cart (source of truth)
  const getCartSelectedMethod = useEffectEvent(() => {
    const cartSelected = cart?.shippingAddress?.selected_shipping_method;
    if (!cartSelected?.carrier_code || !cartSelected?.method_code) return null;
    return `${cartSelected.carrier_code}-${cartSelected.method_code}`;
  });

  // Check if cart's selected method is bullet
  const isCartSelectedMethodBullet = useEffectEvent(() => {
    const cartMethodId = getCartSelectedMethod();
    if (!cartMethodId) return false;
    const cartSelected = cart?.shippingAddress?.selected_shipping_method;
    return (
      cartSelected?.carrier_code?.toLowerCase().includes("express") === true ||
      cartMethodId.toLowerCase().includes("express")
    );
  });

  // Check if a locker address is present in the cart
  const isLockerAddressPresent = useMemo(() => {
    // Check if locker address type is set in checkout context
    if (selectedLockerAddressType) {
      return true;
    }

    // Check if cart's selected shipping method is a locker method
    const cartSelected = cart?.shippingAddress?.selected_shipping_method;
    if (cartSelected?.carrier_code && cartSelected?.method_code) {
      const carrierCode = cartSelected.carrier_code.toLowerCase();
      const methodCode = cartSelected.method_code.toLowerCase();
      return (
        carrierCode.includes("fodellocker") ||
        carrierCode.includes("redboxlocker") ||
        carrierCode.includes("redbox") ||
        methodCode.includes("fodellocker") ||
        methodCode.includes("redboxlocker") ||
        methodCode.includes("redbox")
      );
    }

    return false;
  }, [
    selectedLockerAddressType,
    cart?.shippingAddress?.selected_shipping_method,
  ]);

  // Show eligible toast
  const showEligibleToast = useEffectEvent((method: DeliveryMethod) => {
    if (hasShownEligibleToastRef.current) return;
    hasShownEligibleToastRef.current = true;
    if (isReturningFromPaymentError) return;
    onShowEligibleToast(method);
  });

  // Show ineligible toast
  const showIneligibleToast = useEffectEvent(
    (message: string, type: "info" | "warning" = "info") => {
      if (hasShownIneligibleToastRef.current) return;
      hasShownIneligibleToastRef.current = true;
      if (!isCheckoutAddGiftWrapping) {
        onShowIneligibleToast(message, type);
      }
    }
  );

  // Auto-select standard delivery
  const autoSelectStandard = useEffectEvent(() => {
    const standardMethod = findStandardMethod();

    if (
      standardMethod &&
      standardMethod.carrier_code &&
      standardMethod.method_code
    ) {
      // Use queueMicrotask to ensure React has processed the state update
      // This ensures the useEffect that sets shipping method on cart runs with the new value
      queueMicrotask(() => {
        onMethodChange(standardMethod.id);
      });
    }
  });

  // Handle state transitions
  useEffect(() => {
    const prevState = prevStateRef.current;
    const current = currentState;
    const prevIsLoading = prevIsLoadingRef.current;
    const loadingJustEnded = prevIsLoading && !isLoading;
    const cartSelectedMethod = cart?.shippingAddress?.selected_shipping_method;
    const cartMethodId = cartSelectedMethod
      ? `${cartSelectedMethod.carrier_code}-${cartSelectedMethod.method_code}`
      : null;
    // Detect address change by checking if shipping city changed
    const currentShippingCity = cart?.shippingAddress?.city || null;
    const addressChanged =
      prevShippingCityRef.current !== null &&
      prevShippingCityRef.current !== currentShippingCity;

    // Check if bullet was in previous methods array
    const prevBulletInMethods = prevMethodsRef.current.some(
      (m) =>
        m.id?.toLowerCase().includes("express") ||
        m.carrier_code?.toLowerCase().includes("express")
    );
    const currentBulletInMethods = methods.some(
      (m) =>
        m.id?.toLowerCase().includes("express") ||
        m.carrier_code?.toLowerCase().includes("express")
    );

    // Detect when methods array changes (e.g., address change causes methods to reload)
    // This is important because when address changes, methods reload but bullet might already be in array
    // We need to reset toast flags so toasts can show again for the new address
    // Use a simple comparison: check if methods array length or IDs changed
    const methodsArrayChanged =
      prevMethodsRef.current.length !== methods.length ||
      prevMethodsRef.current.map((m) => m.id).join(",") !==
        methods.map((m) => m.id).join(",");

    // Detect address change: either methods array changed OR shipping city changed
    const addressChangeDetected = methodsArrayChanged || addressChanged;

    // Reset toast flags when address change is detected (address change, cart change, etc.)
    // This ensures toasts can show again when methods reload
    // Only reset if we're not in initial mount, have a previous state, and methods actually changed
    // Also only reset when not loading or loading just ended (to avoid resetting during loading)
    // This allows the "Special case: Loading just ended" logic below to show toasts
    // IMPORTANT: When methods array changes, we should reset eligible toast flag to allow toasts for new address
    // However, we need to be careful about ineligible toast flags to prevent duplicates
    // Check if bullet is disappearing in this same render cycle before resetting flags

    if (
      addressChangeDetected &&
      !isInitialMountRef.current &&
      prevState &&
      (loadingJustEnded || !isLoading)
    ) {
      // Save the selected method before address change (to detect when method was reset due to address change)
      // This must be done BEFORE we reset the flags, so we can check if the previous method was bullet
      // Use cart's selected method as source of truth, as it persists even when UI state is reset
      selectedMethodBeforeAddressChangeRef.current =
        prevSelectedMethodRef.current;
      const cartSelectedMethod =
        cart?.shippingAddress?.selected_shipping_method;
      cartMethodBeforeAddressChangeRef.current = cartSelectedMethod
        ? `${cartSelectedMethod.carrier_code}-${cartSelectedMethod.method_code}`
        : null;
      // Always reset eligible toast flag when methods array changes (address change, cart change)
      // This allows toasts to show again for new address/methods
      hasShownEligibleToastRef.current = false;
      // Also reset the guard flag when address changes
      hasResetFlagForMethodResetRef.current = false;
      // Reset cart method before address change ref when address changes
      // This ensures we capture the cart method for the new address change
      cartMethodBeforeAddressChangeRef.current = null;
      // Reset ineligible toast flags when methods array changes
      // This allows ineligible toasts to show again when methods reload (e.g., after gift wrap add/remove)
      // The bullet disappearance logic will handle showing the toast if needed
      hasShownIneligibleToastRef.current = false;
      hasHandledBulletDisappearanceRef.current = false;
      lastHandledIneligibleMethodRef.current = "";
    }

    // Initial mount: Show toast if bullet is eligible (only when not loading)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevSelectedMethodRef.current = selectedMethod;
      prevIsLoadingRef.current = isLoading;
      // Only show toast if not loading and no locker address is present
      if (
        !isLoading &&
        !isLockerAddressPresent &&
        current.isBulletInArray &&
        current.isEligible &&
        current.bulletMethod
      ) {
        showEligibleToast(current.bulletMethod);
      }
      prevStateRef.current = current;
      return;
    }

    // If currently loading, don't process transitions (wait for loading to end)
    if (isLoading) {
      prevIsLoadingRef.current = isLoading;
      return;
    }

    if (!prevState) {
      // First run after initial mount - just store state and return
      // Don't process any transitions on this first run to prevent false positives
      prevStateRef.current = current;
      prevIsLoadingRef.current = isLoading;
      prevMethodsRef.current = methods;
      return;
    }

    // Bullet appears in array (only process when not loading or loading just ended)
    if (!prevState.isBulletInArray && current.isBulletInArray) {
      // Reset toast flags when bullet appears
      hasShownEligibleToastRef.current = false;
      // Only reset ineligible toast flag if bullet is eligible (bullet truly reappeared, not just during loading)
      // If bullet is ineligible, keep the flag to prevent duplicate toasts when it disappears again
      if (current.isEligible) {
        hasShownIneligibleToastRef.current = false;
        // Only reset disappearance flag if bullet is eligible (truly reappeared)
        hasHandledBulletDisappearanceRef.current = false;
      }

      // Only show toast when loading just ended (not immediately when bullet appears)
      // This prevents showing toast immediately after selecting an address
      if (
        !isLockerAddressPresent &&
        loadingJustEnded &&
        current.isEligible &&
        current.bulletMethod
      ) {
        // If loading just ended, delay toast to ensure UI has stabilized
        const delay = loadingJustEnded ? 100 : 0;
        setTimeout(() => {
          if (
            !isLockerAddressPresent &&
            current.isBulletInArray &&
            current.isEligible &&
            current.bulletMethod &&
            !hasShownEligibleToastRef.current
          ) {
            showEligibleToast(current.bulletMethod);
          }
        }, delay);
      }
    }

    // Special case: Loading just ended and bullet is already in array and eligible
    // This handles the case where bullet was already present before/during loading
    // IMPORTANT: Only show if bullet was NOT in array before (bullet just appeared)
    // OR if we're switching between bullet-eligible addresses (prevState had bullet eligible)
    // This prevents showing toast when switching to non-eligible addresses
    if (
      !isLockerAddressPresent &&
      loadingJustEnded &&
      current.isBulletInArray &&
      current.isEligible &&
      current.bulletMethod &&
      !hasShownEligibleToastRef.current &&
      // Only show if bullet just appeared OR previous address also had bullet eligible
      (!prevState.isBulletInArray ||
        (prevState.isBulletInArray && prevState.isEligible))
    ) {
      // Delay toast to ensure UI has stabilized after loading ends
      setTimeout(() => {
        if (
          !isLockerAddressPresent &&
          current.isBulletInArray &&
          current.isEligible &&
          current.bulletMethod &&
          !hasShownEligibleToastRef.current
        ) {
          showEligibleToast(current.bulletMethod);
        }
      }, 100);
    }

    // Bullet disappears from array - check both state and methods array
    const bulletDisappearedFromMethods =
      prevBulletInMethods && !currentBulletInMethods;
    const bulletDisappearedFromState =
      prevState.isBulletInArray && !current.isBulletInArray;

    // Bullet disappears from array (only process when loading just ended or not loading)
    if (bulletDisappearedFromState || bulletDisappearedFromMethods) {
      // Only process if loading just ended, and no locker address is present
      // IMPORTANT: Skip on initial mount (when prevState was just set for the first time)
      // to prevent showing ineligible toast on initial load
      // IMPORTANT: Only show toast when loading just ended, not while loading is in progress
      // This prevents showing toast immediately after closing gift wrap drawer - wait for loading to complete
      // We use loadingJustEnded instead of !prevIsLoading to ensure toast only shows after loading completes
      if (
        !isLockerAddressPresent &&
        loadingJustEnded && // Only show when loading just ended, not while loading or before loading starts
        prevState.isBulletInArray !== undefined // Ensure we have a valid previous state (not initial mount)
      ) {
        // Only handle if we haven't already handled this disappearance to prevent duplicate toasts
        // Also check if we've already shown the ineligible toast to prevent duplicates
        if (
          hasHandledBulletDisappearanceRef.current ||
          hasShownIneligibleToastRef.current
        ) {
          // Already handled or toast already shown, skip to prevent duplicate toasts
          return;
        }
        // Reset toast flags when bullet disappears (only on first detection)
        // Reset eligible toast flag so it can be shown again when bullet becomes eligible
        hasShownEligibleToastRef.current = false;
        hasShownIneligibleToastRef.current = false;
        // Mark that we've handled bullet disappearance to prevent duplicate toasts
        hasHandledBulletDisappearanceRef.current = true;

        // Check if bullet was previously selected
        // Check: previous state had bullet selected, OR previous selected method ID was bullet,
        // OR current selected method is bullet, OR cart's selected method is bullet
        // OR if bullet was in previous methods array (safety: when bullet disappears, auto-select standard)
        const prevWasBulletSelected = prevState.isBulletSelected;
        const prevMethodWasBullet = isBulletMethod(
          prevSelectedMethodRef.current
        );
        const currentMethodIsBullet = isBulletMethod(selectedMethod);
        const cartMethodIsBullet = isCartSelectedMethodBullet();
        // Safety check: If bullet was available and now it's gone, auto-select standard
        // This handles the case where selectedMethod was cleared before we could track it
        const bulletWasAvailableAndNowGone =
          prevBulletInMethods && !currentBulletInMethods;

        if (
          prevWasBulletSelected ||
          prevMethodWasBullet ||
          currentMethodIsBullet ||
          cartMethodIsBullet ||
          bulletWasAvailableAndNowGone
        ) {
          autoSelectStandard();
          showIneligibleToast("standardApplied", "warning");
        }
      }
    }

    // Additional check: Selected method is bullet but bullet is not in array
    // This handles cases where address changes and methods array updates,
    // but selectedMethod still references the bullet method ID OR cart has bullet selected
    // Only process when loading just ended, and no locker address is present
    // Skip this check if we already handled bullet disappearance above to prevent duplicate toasts
    // Also skip if we've already shown the ineligible toast (first check already handled it)
    // IMPORTANT: Skip on initial mount (when prevState was just set for the first time)
    // to prevent showing ineligible toast on initial load
    // IMPORTANT: Only show when loading just ended to prevent showing toast immediately after drawer closes
    if (
      !isLockerAddressPresent &&
      loadingJustEnded && // Only show when loading just ended, not while loading or before loading starts
      !hasHandledBulletDisappearanceRef.current &&
      !hasShownIneligibleToastRef.current &&
      prevState.isBulletInArray !== undefined // Ensure we have a valid previous state (not initial mount)
    ) {
      const selectedMethodIsBullet = isBulletMethod(selectedMethod);
      const prevSelectedWasBullet = isBulletMethod(
        prevSelectedMethodRef.current
      );
      const cartMethodIsBullet = isCartSelectedMethodBullet();

      if (
        !current.isBulletInArray &&
        (selectedMethodIsBullet || cartMethodIsBullet) &&
        // Only handle if we haven't already handled this specific method
        (selectedMethod || cartMethodId) !==
          lastHandledIneligibleMethodRef.current &&
        // This is a transition if: prev state had bullet in array OR prev selected was bullet OR cart has bullet
        // IMPORTANT: Only show toast if this is a REAL transition (prevState had bullet in array),
        // not on initial load where prevState was just initialized
        (prevState.isBulletInArray ||
          (prevSelectedWasBullet && prevState.isBulletInArray !== undefined) ||
          (prevState.isBulletSelected &&
            prevState.isBulletInArray !== undefined) ||
          (cartMethodIsBullet && prevState.isBulletInArray !== undefined))
      ) {
        // Mark this method as handled
        lastHandledIneligibleMethodRef.current =
          selectedMethod || cartMethodId || "";
        // Don't reset toast flag here - if first check already showed it, don't show again
        autoSelectStandard();
        showIneligibleToast("standardApplied", "warning");
      }
    }

    // Reset handled method ref when bullet appears in array again
    if (current.isBulletInArray) {
      lastHandledIneligibleMethodRef.current = "";
    }

    // Bullet becomes ineligible (still in array, but checks fail)
    // Process when loading just ended OR when not loading (for time-based transitions like cutoff time)
    // IMPORTANT: When loading just ended, show immediately. When not loading, only show if bullet was previously eligible
    // This handles both cases: 1) Loading completes and bullet is ineligible, 2) Time passes and cutoff makes bullet ineligible
    if (
      !isLockerAddressPresent &&
      (loadingJustEnded || (!isLoading && prevState.isEligible)) && // Allow when not loading if bullet was previously eligible (time-based transition)
      current.isBulletInArray &&
      prevState.isBulletInArray &&
      prevState.isEligible &&
      !current.isEligible &&
      current.isBulletSelected
    ) {
      // Reset toast flags when bullet becomes ineligible
      // Reset eligible toast flag so it can be shown again when bullet becomes eligible
      hasShownEligibleToastRef.current = false;
      hasShownIneligibleToastRef.current = false;

      autoSelectStandard();

      const cutOffMessage =
        storeConfig?.bulletDeliveryConfig?.cutOffTimeMessage;
      if (cutOffMessage && current.cutoffPassed) {
        showIneligibleToast(cutOffMessage, "warning");
      } else {
        showIneligibleToast("standardApplied", "warning");
      }
    }

    // Bullet becomes eligible (only process when loading just ended or not loading, and no locker address is present)
    if (
      !isLockerAddressPresent &&
      (loadingJustEnded || !prevIsLoading) &&
      current.isBulletInArray &&
      prevState.isBulletInArray &&
      !prevState.isEligible &&
      current.isEligible &&
      current.bulletMethod
    ) {
      // Reset eligible toast flag when bullet becomes eligible again (after being ineligible)
      // This allows the toast to be shown when bullet transitions from ineligible to eligible
      hasShownEligibleToastRef.current = false;
      showEligibleToast(current.bulletMethod);
    }

    // Handle address change: Show eligible toast when switching between bullet-eligible addresses
    // This happens when the delivery method is reset due to address change
    // We detect this by checking if: loading just ended, previous method was bullet, current method is not bullet
    // and bullet is still eligible (meaning we switched to another bullet-eligible address)

    // Reset eligible toast flag when method is reset but bullet is still eligible
    // This handles the case when switching between bullet-eligible addresses where city/methods don't change immediately
    // IMPORTANT: If cartMethodBeforeAddressChangeRef is not set (address change wasn't detected), use current cart method
    // This ensures we can detect method reset even when address change detection fails (e.g., same methods/city)
    if (
      !isLockerAddressPresent &&
      !selectedMethod && // Method was reset (empty)
      current.isBulletInArray &&
      current.isEligible &&
      !hasResetFlagForMethodResetRef.current // Only reset once per method reset event
    ) {
      // If cartMethodBeforeAddressChangeRef is not set, try to get it from current cart or previous selected method
      let previousCartMethod = cartMethodBeforeAddressChangeRef.current;
      if (!previousCartMethod) {
        // Use current cart method if available, or previous selected method
        previousCartMethod = cartMethodId || prevSelectedMethodRef.current;
      }

      // Only reset flag if previous method was bullet
      if (previousCartMethod && isBulletMethod(previousCartMethod)) {
        // Save it for the address change check later
        if (!cartMethodBeforeAddressChangeRef.current) {
          cartMethodBeforeAddressChangeRef.current = previousCartMethod;
        }
        // Reset the flag to allow toast to show when loading ends
        hasShownEligibleToastRef.current = false;
        hasResetFlagForMethodResetRef.current = true;
      }
    }

    // Reset the guard when method is selected again (user selected a method)
    if (selectedMethod && hasResetFlagForMethodResetRef.current) {
      hasResetFlagForMethodResetRef.current = false;
    }
    // Show eligible toast when switching between bullet-eligible addresses
    // Conditions:
    // 1. Loading just ended (methods have loaded)
    // 2. Bullet is eligible in new address
    // 3. Method was reset (empty) but cart still has bullet method
    // 4. Previous address also had bullet eligible
    if (
      !isLockerAddressPresent &&
      loadingJustEnded &&
      current.isBulletInArray &&
      current.isEligible &&
      current.bulletMethod &&
      !hasShownEligibleToastRef.current &&
      prevState.isBulletInArray && // Bullet was in array before (previous address also had bullet)
      prevState.isEligible && // Previous address was also bullet-eligible
      !selectedMethod && // Current selected method is empty (was reset)
      // Check if cart had bullet method before address change OR current cart has bullet method
      // Use cartMethodBeforeAddressChangeRef if available, otherwise fall back to current cart method
      ((cartMethodBeforeAddressChangeRef.current &&
        isBulletMethod(cartMethodBeforeAddressChangeRef.current)) ||
        (cartMethodId && isBulletMethod(cartMethodId))) // Cart has/had bullet method
    ) {
      // Delay toast to ensure UI has stabilized after loading ends
      setTimeout(() => {
        if (
          !isLockerAddressPresent &&
          current.isBulletInArray &&
          current.isEligible &&
          current.bulletMethod &&
          !hasShownEligibleToastRef.current
        ) {
          showEligibleToast(current.bulletMethod);
        }
      }, 100);
    }

    // Update previous state
    prevStateRef.current = current;
    prevSelectedMethodRef.current = selectedMethod;
    prevMethodsRef.current = methods;
    prevIsLoadingRef.current = isLoading;
    prevShippingCityRef.current = currentShippingCity;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentState,
    selectedMethod,
    storeConfig,
    methods,
    isLoading,
    isLockerAddressPresent,
    cart?.shippingAddress?.selected_shipping_method,
  ]);
}
