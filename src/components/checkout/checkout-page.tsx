"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { CheckoutOrderReviewTracker } from "@/components/analytics/checkout-order-review-tracker";
import { OrderActions } from "@/components/cart/order/order-summary/order-actions";
import { CheckoutEditBagLink } from "@/components/checkout/checkout-edit-bag-link";
import { CheckoutHeader } from "@/components/checkout/checkout-header/checkout-header";
import { CheckoutStickyFooter } from "@/components/checkout/checkout-sticky-footer";
import { ManageAddressView } from "@/components/customer/addresses/manage-address/manage-address-view";
import { useToastContext } from "@/components/providers/toast-provider";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { AddressFormContextProvider } from "@/contexts/address-form-context";
import { useApplePayContext } from "@/contexts/apple-pay-context";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useUI } from "@/contexts/use-ui";
import { useOrderSummary } from "@/hooks/checkout/use-order-summary";
import { usePaymentStatusError } from "@/hooks/checkout/use-payment-status-error";
import { usePaymentStatusParam } from "@/hooks/checkout/use-payment-status-param";
import { useTrackCheckoutSubmitError } from "@/hooks/checkout/use-track-checkout-submit-error";
import { useTrackPurchaseAttempt } from "@/hooks/checkout/use-track-purchase-attempt";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { useApplePayPlaceOrder } from "@/hooks/mutations/checkout/use-apple-pay-place-order";
import { useValidateBin } from "@/hooks/mutations/checkout/use-validate-bin";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { usePathname, useRouter } from "@/i18n/navigation";
import { placeOrderAction } from "@/lib/actions/checkout/place-order";
import { setBillingAddressOnCartAction } from "@/lib/actions/checkout/set-billing-address-on-cart";
import { setPaymentMethodOnCartAction } from "@/lib/actions/checkout/set-payment-method-on-cart";
import { setShippingAddressOnCartAction } from "@/lib/actions/checkout/set-shipping-address-on-cart";
import { setShippingMethodsOnCartAction } from "@/lib/actions/checkout/set-shipping-methods-on-cart";
import { updateProfileFromAddress } from "@/lib/actions/customer/update-profile";
import {
  trackAddressbookDeleteAddress,
  trackBackToShippingType,
  trackCheckoutAddressNew,
  trackCheckoutDeliveryShippingTypeSelection,
  trackCheckoutOrderReviewEditAddress,
  trackCheckoutPaymentMethodSaved,
  trackPurchaseError,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { CheckoutError } from "@/lib/constants/checkout-error";
import {
  CHECKOUT_ADDRESS_SAVED_EVENT,
  CHECKOUT_ADDRESS_SAVED_FLAG,
} from "@/lib/constants/checkout/events";
import { Locale } from "@/lib/constants/i18n";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { DEFAULT_TOAST_DURATION } from "@/lib/constants/ui";
import { sleep } from "@/lib/utils/async";
import {
  clearLockerInfo,
  getLockerInfo,
} from "@/lib/utils/checkout/locker-storage";
import { isNetworkError, isTimeoutError } from "@/lib/utils/network-error";
import { extractBinNumber } from "@/lib/utils/payment-card";
import {
  isApplePayPaymentMethod,
  isCheckoutComPaymentMethod,
  requiresCardPaymentSection,
} from "@/lib/utils/payment-method";
import { formatPrice } from "@/lib/utils/price";
import { isOk } from "@/lib/utils/service-result";
import { setSessionStorage } from "@/lib/utils/session-storage";

import { CheckoutAddressDrawer } from "./checkout-address-drawer";
import { CheckoutDeliverySection } from "./delivery/checkout-delivery-section";
import { CheckoutOrderSummary } from "./order-summary/checkout-order-summary";
import { CheckoutPaymentMethods } from "./payment/checkout-payment-methods";
import {
  CheckoutShippingAddressSection,
  type CustomerAddress,
} from "./shipping-address/checkout-shipping-address-section";
import { CheckoutShippingOptionDrawer } from "./shipping-methods/checkout-shipping-option-drawer";

import type { DeliveryMethod } from "./delivery/delivery-methods/types";
import type { CartAddressInput } from "@/graphql/graphql";
import type { CustomerAddress as CustomerAddressModel } from "@/lib/models/customer-addresses";
import type { PlaceOrderFailureResult } from "@/lib/types/checkout/place-order";

export type CheckoutAddress = {
  customerAddress: CheckoutCustomerAddress;
} & CustomerAddress;

export type PaymentCardData = {
  bin?: string;
  cardNetwork: string;
  checkoutPaymentId?: null | string;
  expiry: string;
  id: string;
  isDefault: boolean;
  isExpired: boolean;
  last4: string;
  sourceId: string;
};

type AddressDrawerView = "form" | "list";

type CheckoutCustomerAddress = {
  countryLabel?: string;
  stateLabel?: string;
} & CustomerAddressModel;

type CheckoutCustomerInfo = {
  email?: null | string;
  firstName?: null | string;
  lastName?: null | string;
  phoneNumber?: null | string;
} | null;

interface CheckoutPageProps {
  customerInfo?: CheckoutCustomerInfo;
  initialAddresses: CheckoutAddress[];
  initialPaymentCards?: PaymentCardData[];
}

function CheckoutPage({
  customerInfo = null,
  initialAddresses,
  initialPaymentCards = [],
}: CheckoutPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const t = useTranslations("CheckoutPage");
  const isMobile = useIsMobile();
  const { showOtpLoginPopup } = useAuthUI();
  const { isAuthorized } = useUI();
  const { showError, showSuccess } = useToastContext();
  const { data: currentCustomer, isLoading: isCustomerLoading } =
    useCustomerQuery();
  const { storeConfig } = useStoreConfig();
  const { cart, isLoading: isCartLoading } = useCart();
  const { mutateAsync: validateBin } = useValidateBin();

  // Memoize estimated delivery days map to avoid recreating on every render
  const estimatedDeliveryDaysMap = useMemo(() => {
    const map = new Map<string, string>();
    if (storeConfig?.estimatedDeliveryDays) {
      const isArabic = locale.toLowerCase().startsWith("ar");
      storeConfig.estimatedDeliveryDays.forEach((item) => {
        const daysText = isArabic
          ? item.days_ar || item.days_en || ""
          : item.days_en || item.days_ar || "";
        if (daysText) {
          // Map both full method codes and short codes
          map.set(item.method, daysText);
          // Also map the short code version (e.g., "flatrate" -> "lambdashipping_flatrate")
          const shortCode = item.method.replace("lambdashipping_", "");
          if (shortCode !== item.method) {
            map.set(shortCode, daysText);
          }
        }
      });
    }
    return map;
  }, [storeConfig?.estimatedDeliveryDays, locale]);

  // Memoize shipping code mapping function
  const mapShippingCode = useCallback((code: string): string => {
    const lowerCode = code.toLowerCase();
    // Map short codes to full lambda shipping codes
    // Handle variations: flatrate, flat_rate, flaterate
    if (
      lowerCode === "flatrate" ||
      lowerCode === "flat_rate" ||
      lowerCode === "flaterate"
    ) {
      return "lambdashipping_flatrate";
    }
    // If it already starts with lambdashipping_, return as is
    if (lowerCode.startsWith("lambdashipping_")) {
      return code;
    }
    // For express or other methods, check if they need mapping
    // For now, return as is if it doesn't match known patterns
    return code;
  }, []);
  const { selectedLockerAddressType, setSelectedLockerAddressType } =
    useCheckoutContext();
  const [addresses, setAddresses] =
    useState<CheckoutAddress[]>(initialAddresses);
  const previousAddressIdsRef = useRef<Set<string>>(
    new Set(initialAddresses.map((addr) => addr.id))
  );
  const [selectedAddressId, setSelectedAddressId] = useState<null | string>(
    () => {
      const defaultAddress = initialAddresses.find(
        (address) => address.isDefault
      );
      return defaultAddress ? defaultAddress.id : null;
    }
  );
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [addressDrawerView, setAddressDrawerView] =
    useState<AddressDrawerView>("list");
  const [initialAddressTab, setInitialAddressTab] = useState<
    "gifting" | "home" | undefined
  >(undefined);
  const [editingAddress, setEditingAddress] = useState<CheckoutAddress | null>(
    null
  );
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const { selectedPayment, setSelectedPayment } = useCheckoutContext();
  // Track cart ID to prevent auto-selection from cart after order (new cart)
  const previousCartIdRef = useRef<null | string>(null);
  const [paymentCardToken, setPaymentCardToken] = useState<null | string>(null);
  const [selectedPaymentCard, setSelectedPaymentCard] =
    useState<null | PaymentCardData>(null);
  // Track if we're restoring a card selection (to prevent auto-select from overriding)
  const isRestoringCardRef = useRef(false);
  // Track if auto-select should be permanently disabled (after restoration or manual selection)
  // Using STATE so changes trigger re-renders and propagate to child components
  const [shouldDisableAutoSelect, setShouldDisableAutoSelect] = useState(false);

  // Get card ID to restore from session storage (if any)
  const cardIdToRestore = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedInfo = window.sessionStorage.getItem(
        SessionStorageKey.PAYMENT_METHOD_INFO
      );
      if (storedInfo) {
        const info = JSON.parse(storedInfo) as {
          selectedCardId?: null | string;
        };
        return info.selectedCardId || null;
      }
    } catch {
      // Ignore errors
    }
    return null;
  }, []);
  // Store CVV for saved cards (will be passed to backend when placing order)
  const [savedCardCvv, setSavedCardCvv] = useState<null | string>(null);

  const lastCardSelectionRef = useRef<{
    card: null | PaymentCardData;
    cvv: null | string;
    cvvTimestamp?: number;
    token: null | string;
  }>({ card: null, cvv: null, token: null });
  const hasRestoredSelectionsRef = useRef(false);
  const isRestoringSelectionsRef = useRef(false);

  // CVV expiration time: 1 hour (3600000 ms)
  const CVV_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
  // Store card number and CVV for PayFort (temporary, in memory only)
  const [payfortCardNumber, setPayfortCardNumber] = useState<null | string>(
    null
  );
  const [payfortCvv, setPayfortCvv] = useState<null | string>(null);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<DeliveryMethod[]>([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    Array<{ code: string; downtime_alert?: null | string; title: string }>
  >([]);
  const [prefetchedPaymentCards, setPrefetchedPaymentCards] = useState<
    PaymentCardData[]
  >([]);
  const hasPrefetchedCardsRef = useRef(false);
  const [isPlacingOrderPending, startPlaceOrderTransition] = useTransition();
  const { isShippingOptionDrawerOpen, setIsShippingOptionDrawerOpen } =
    useCheckoutContext();
  const [isLoadingShippingMethods, setIsLoadingShippingMethods] = useState(
    () => initialAddresses.length > 0
  );
  const [hasReceivedShippingMethods, setHasReceivedShippingMethods] =
    useState(false);
  const [isRefreshingAddresses, setIsRefreshingAddresses] = useState(false);
  const isSettingShippingMethodRef = useRef(false);
  const isSettingShippingAddressRef = useRef(false);
  const isSettingBillingAddressRef = useRef(false);
  const previousSelectedAddressIdRef = useRef<null | string>(null);
  const previousCartItemsRef = useRef<number>(0);
  const lastSetShippingMethodRef = useRef<null | string>(null);
  const [isSettingShippingAddress, setIsSettingShippingAddress] =
    useState(false);
  const [isSettingBillingAddress, setIsSettingBillingAddress] = useState(false);
  const [isSettingShippingMethod, setIsSettingShippingMethod] = useState(false);
  const [isRefreshingPaymentMethods, setIsRefreshingPaymentMethods] =
    useState(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState<
    null | string
  >(null);
  const hasAppliedPaymentFromCartRef = useRef(false);
  const hasPromptedLoginRef = useRef(false);
  // Track when user is actively selecting a payment method to prevent auto-apply from interfering
  const isSelectingPaymentMethodRef = useRef(false);
  // Track component mount state to prevent errors during unmount/navigation
  const isMountedRef = useRef(true);

  const deliveryMethodsJustLoadedRef = useRef(false);
  const pathname = usePathname();
  const { paymentStatus } = usePaymentStatusParam();
  const paymentStatusRef = useRef<null | string>(null);

  const { deductions, totalDue, totals } = useOrderSummary();

  const { isPending: isApplePayAvailabilityPending } = useApplePayContext();

  const {
    isPending: isApplePayPlaceOrderPending,
    mutate: placeOrderWithApplePay,
  } = useApplePayPlaceOrder({
    selectedPayment,
    selectedShippingOption: selectedShippingOption || "",
  });

  // Cleanup on unmount to prevent showing errors when navigating away
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const isOnCheckoutPage = pathname === ROUTES.CHECKOUT.ROOT;

    // Always clear ref when navigating away from checkout page
    if (!isOnCheckoutPage) {
      if (paymentStatusRef.current) {
        paymentStatusRef.current = null;
        hasRestoredSelectionsRef.current = false;
      }
      return;
    }

    // Only store paymentStatus if it's Cancelled or Failed
    if (
      paymentStatus === PaymentStatus.Cancelled ||
      paymentStatus === PaymentStatus.Failed
    ) {
      // Only store if we don't already have it stored (avoid overwriting)
      if (paymentStatusRef.current !== paymentStatus) {
        paymentStatusRef.current = paymentStatus;
      }
    } else {
      // Clear ref when paymentStatus is null or not Cancelled/Failed (normal flow)
      if (paymentStatusRef.current) {
        paymentStatusRef.current = null;
        hasRestoredSelectionsRef.current = false;
      }
    }
  }, [pathname, paymentStatus]);

  usePaymentStatusError();
  // Restore selections from cart data after cart refill
  const restoreSelections = useCallback(async () => {
    if (typeof window === "undefined" || !cart) {
      return;
    }

    // Set flag to prevent address change effect from clearing payment method during restore
    isRestoringSelectionsRef.current = true;

    // Set available payment methods from cart if not already set
    if (
      cart.availablePaymentMethods &&
      cart.availablePaymentMethods.length > 0
    ) {
      const cartPaymentMethods = cart.availablePaymentMethods.filter(
        (method) => method?.code
      );
      if (cartPaymentMethods.length > 0) {
        setAvailablePaymentMethods(
          cartPaymentMethods.map((method) => ({
            code: method.code!,
            downtime_alert: method.downtime_alert ?? null,
            title: method.title ?? method.code!,
          }))
        );
      }
    }

    if (
      cart.shippingAddress?.available_shipping_methods &&
      cart.shippingAddress.available_shipping_methods.length > 0 &&
      shippingMethods.length === 0
    ) {
      const cartShippingMethods =
        cart.shippingAddress.available_shipping_methods.filter(
          (method): method is NonNullable<typeof method> => !!method
        );

      if (cartShippingMethods.length > 0) {
        // Helper function to map short carrier/method codes to full codes
        const mapShippingCode = (code: null | string | undefined): string => {
          if (!code) return "";
          const lowerCode = code.toLowerCase();
          // Map short codes to full lambda shipping codes
          if (
            lowerCode === "flatrate" ||
            lowerCode === "flat_rate" ||
            lowerCode === "flaterate"
          ) {
            return "lambdashipping_flatrate";
          }
          // If it already starts with lambdashipping_, return as is
          if (lowerCode.startsWith("lambdashipping_")) {
            return code;
          }
          return code;
        };

        // Get estimated delivery days from store config
        const estimatedDeliveryDaysMap = new Map<string, string>();
        if (storeConfig?.estimatedDeliveryDays) {
          const isArabic = locale.toLowerCase().startsWith("ar");
          storeConfig.estimatedDeliveryDays.forEach((item) => {
            const daysText = isArabic
              ? item.days_ar || item.days_en || ""
              : item.days_en || item.days_ar || "";
            if (daysText) {
              estimatedDeliveryDaysMap.set(item.method, daysText);
              const shortCode = item.method.replace("lambdashipping_", "");
              if (shortCode !== item.method) {
                estimatedDeliveryDaysMap.set(shortCode, daysText);
              }
            }
          });
        }

        const normalizedMethods: DeliveryMethod[] = cartShippingMethods
          .map((method) => {
            const priceValue = method?.amount?.value ?? 0;
            const currency = method?.amount?.currency;
            const rawCarrierCode = method?.carrier_code ?? "";
            const rawMethodCode = method?.method_code ?? "";

            // Map to full codes for API calls
            const carrierCode = mapShippingCode(rawCarrierCode);
            const methodCode = mapShippingCode(rawMethodCode);

            // Get estimated delivery days for this method from store config
            const fullMethodCode = `${carrierCode}_${methodCode}`;
            const methodId = `${carrierCode}-${methodCode}`;
            const rawMethodId = `${rawCarrierCode}-${rawMethodCode}`;

            // Try to find estimated delivery days from store config
            const estimatedTime =
              estimatedDeliveryDaysMap.get(fullMethodCode) ||
              estimatedDeliveryDaysMap.get(methodCode) ||
              estimatedDeliveryDaysMap.get(carrierCode) ||
              estimatedDeliveryDaysMap.get(methodId) ||
              estimatedDeliveryDaysMap.get(rawMethodCode) ||
              estimatedDeliveryDaysMap.get(rawCarrierCode) ||
              estimatedDeliveryDaysMap.get(rawMethodId) ||
              undefined;

            return {
              carrier_code: carrierCode,
              carrier_title: method?.carrier_title ?? undefined,
              currency: currency ?? undefined,
              estimatedTime,
              id: methodId,
              method_code: methodCode,
              name:
                method?.method_title ??
                method?.carrier_title ??
                rawCarrierCode ??
                "Shipping",
              price: (priceValue > 0 ? Number(priceValue) : "free") as
                | "free"
                | number,
            };
          })
          .filter((method) => {
            // Exclude redbox and fodel methods (same filter as in UI)
            const id = method?.id?.toLowerCase() ?? "";

            if (id.includes("fodel") || id.includes("redbox")) {
              return false;
            }

            // Exclude bullet delivery if not eligible
            if (cart?.isBulletEligible === false && id.includes("express")) {
              return false;
            }

            return true;
          });

        if (normalizedMethods.length > 0) {
          setShippingMethods(normalizedMethods);
          setHasReceivedShippingMethods(true);
          setIsLoadingShippingMethods(false);
        }
      }
    }

    // Restore address from cart shipping address
    if (cart.shippingAddress) {
      const cartShippingAddress = cart.shippingAddress;
      const cartStreet = Array.isArray(cartShippingAddress.street)
        ? (cartShippingAddress.street.filter(
            (s): s is string => typeof s === "string" && s !== null
          ) as string[])
        : [];
      const cartCity = cartShippingAddress.city;
      const cartFirstname = cartShippingAddress.firstname;
      const cartLastname = cartShippingAddress.lastname;
      const cartTelephone = cartShippingAddress.telephone;

      const matchedAddress = addresses.find((addr) => {
        const addrCity = addr.customerAddress?.city;
        const addrFirstname = addr.customerAddress?.firstname;
        const addrLastname = addr.customerAddress?.lastname;
        const addrStreet = addr.customerAddress?.street;
        const addrPhoneNumber = addr.phoneNumber;

        // Strategy 1: Match by street address (most reliable)
        if (cartStreet.length > 0 && addrStreet) {
          // addrStreet is an array (null | string)[] | null
          const addrStreetArray = Array.isArray(addrStreet)
            ? addrStreet.filter(
                (s): s is string => typeof s === "string" && s !== null
              )
            : [];
          const firstCartStreet: string | undefined = cartStreet[0];
          const firstAddrStreet: string | undefined = addrStreetArray[0];
          if (firstCartStreet && firstAddrStreet) {
            const cartStreetNormalized = firstCartStreet.toLowerCase().trim();
            const addrStreetNormalized = firstAddrStreet.toLowerCase().trim();
            if (cartStreetNormalized && addrStreetNormalized) {
              // Check if street addresses match (at least partially)
              if (
                cartStreetNormalized === addrStreetNormalized ||
                cartStreetNormalized.includes(addrStreetNormalized) ||
                addrStreetNormalized.includes(cartStreetNormalized)
              ) {
                return true;
              }
            }
          }
        }

        // Strategy 2: Match by city + firstname + lastname (exact match)
        if (
          addrCity &&
          cartCity &&
          typeof addrCity === "string" &&
          typeof cartCity === "string" &&
          addrCity.toLowerCase().trim() === cartCity.toLowerCase().trim() &&
          addrFirstname &&
          cartFirstname &&
          typeof addrFirstname === "string" &&
          typeof cartFirstname === "string" &&
          addrFirstname.toLowerCase().trim() ===
            cartFirstname.toLowerCase().trim() &&
          addrLastname &&
          cartLastname &&
          typeof addrLastname === "string" &&
          typeof cartLastname === "string" &&
          addrLastname.toLowerCase().trim() ===
            cartLastname.toLowerCase().trim()
        ) {
          return true;
        }

        // Strategy 3: Match by city + firstname (less strict)
        if (
          addrCity &&
          cartCity &&
          typeof addrCity === "string" &&
          typeof cartCity === "string" &&
          addrCity.toLowerCase().trim() === cartCity.toLowerCase().trim() &&
          addrFirstname &&
          cartFirstname &&
          typeof addrFirstname === "string" &&
          typeof cartFirstname === "string" &&
          addrFirstname.toLowerCase().trim() ===
            cartFirstname.toLowerCase().trim()
        ) {
          return true;
        }

        // Strategy 4: Match by phone number (if available)
        if (
          cartTelephone &&
          addrPhoneNumber &&
          typeof cartTelephone === "string" &&
          typeof addrPhoneNumber === "string"
        ) {
          const cartPhoneNormalized = cartTelephone.replace(/\D/g, "");
          const addrPhoneNormalized = addrPhoneNumber.replace(/\D/g, "");
          if (
            cartPhoneNormalized &&
            addrPhoneNormalized &&
            cartPhoneNormalized === addrPhoneNormalized
          ) {
            return true;
          }
        }

        return false;
      });

      if (matchedAddress) {
        setSelectedAddressId(matchedAddress.id);
      }
    }

    if (cart.shippingAddress?.selected_shipping_method) {
      const cartSelectedMethod = cart.shippingAddress.selected_shipping_method;
      const cartCarrierCode = cartSelectedMethod.carrier_code;
      const cartMethodCode = cartSelectedMethod.method_code;

      const deliveryMethodId = `${cartCarrierCode}-${cartMethodCode}`;

      if (shippingMethods.length > 0) {
        const matchedMethod = shippingMethods.find((method) => {
          return (
            method.carrier_code === cartCarrierCode &&
            method.method_code === cartMethodCode
          );
        });

        if (matchedMethod) {
          setSelectedDelivery(matchedMethod.id);
        } else {
          setSelectedDelivery(deliveryMethodId);
        }
      } else {
        setSelectedDelivery(deliveryMethodId);
      }
    }

    if (cart.selectedPaymentMethod?.code) {
      const cartPaymentCode = cart.selectedPaymentMethod.code;

      // Find the matching payment method in cart's available payment methods
      // Use the actual backend code from cart's availablePaymentMethods to ensure it matches the UI
      const cartAvailableMethods =
        cart.availablePaymentMethods?.filter((method) => method?.code) || [];
      const matchingMethod = cartAvailableMethods.find(
        (method) => method.code!.toLowerCase() === cartPaymentCode.toLowerCase()
      );

      // Restore selected card for checkout.com payment method
      // CRITICAL: Restore card BEFORE setting payment method to avoid effects clearing it
      const needsSyncCardRestore = isCheckoutComPaymentMethod(cartPaymentCode);

      if (needsSyncCardRestore) {
        try {
          const storedInfo = window.sessionStorage.getItem(
            SessionStorageKey.PAYMENT_METHOD_INFO
          );

          if (storedInfo) {
            const paymentMethodInfo = JSON.parse(storedInfo) as {
              paymentMethod?: string;
              selectedCardId?: null | string;
              shippingMethod?: string;
            };

            if (
              paymentMethodInfo.selectedCardId &&
              initialPaymentCards.length > 0
            ) {
              const matchingCard = initialPaymentCards.find(
                (card) => card.id === paymentMethodInfo.selectedCardId
              );

              if (matchingCard) {
                // Set flag to prevent auto-select from overriding
                isRestoringCardRef.current = true;
                // Permanently disable auto-select after restoration (using setState for re-render)
                setShouldDisableAutoSelect(true);

                // Set card immediately to restore selection
                setSelectedPaymentCard(matchingCard);
              }
            }
          }
        } catch {
          // Silently fail - restoration is not critical
        }
      }

      // Now set the payment method AFTER card is restored
      if (matchingMethod) {
        // Use the backend code directly (UI uses backend codes as IDs)
        // For checkout.com with card restoration, set synchronously
        if (needsSyncCardRestore) {
          setSelectedPayment(matchingMethod.code!);
        } else {
          setTimeout(() => {
            setSelectedPayment(matchingMethod.code!);
          }, 0);
        }
      } else {
        // Fallback: use the cart payment code directly if not found in available methods
        if (needsSyncCardRestore) {
          setSelectedPayment(cartPaymentCode);
        } else {
          setTimeout(() => {
            setSelectedPayment(cartPaymentCode);
          }, 0);
        }
      }

      // Clear restoration flag after a delay
      if (needsSyncCardRestore) {
        setTimeout(() => {
          isRestoringCardRef.current = false;
        }, 700);
      }
    }

    // Clear restore flag after a short delay to allow all state updates to complete
    setTimeout(() => {
      isRestoringSelectionsRef.current = false;

      // Clear session storage after restoration is complete
      // This prevents stale data from affecting future orders
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.removeItem(
            SessionStorageKey.PAYMENT_METHOD_INFO
          );
        } catch {
          // Silently fail - clearing session storage is not critical
        }
      }
    }, 100);
  }, [
    cart,
    shippingMethods,
    storeConfig,
    locale,
    addresses,
    setSelectedPayment,
    initialPaymentCards,
  ]);

  // Apply payment method from cart once payment methods are loaded
  useEffect(() => {
    const cartPaymentCode = cart?.selectedPaymentMethod?.code;
    if (
      hasAppliedPaymentFromCartRef.current ||
      isSelectingPaymentMethodRef.current ||
      !cartPaymentCode ||
      !selectedDelivery ||
      availablePaymentMethods.length === 0 ||
      selectedPayment
    ) {
      return;
    }

    // Find the matching payment method in available payment methods
    // Use the actual backend code from availablePaymentMethods to ensure it matches the UI
    const matchingMethod = availablePaymentMethods.find(
      (method) => method.code.toLowerCase() === cartPaymentCode.toLowerCase()
    );

    if (matchingMethod) {
      // Use the backend code directly (UI uses backend codes as IDs)
      hasAppliedPaymentFromCartRef.current = true;
      setSelectedPayment(matchingMethod.code);
    }
  }, [
    availablePaymentMethods,
    cart?.selectedPaymentMethod?.code,
    selectedDelivery,
    selectedPayment,
    setSelectedPayment,
  ]);

  useEffect(() => {
    const storedPaymentStatus = paymentStatusRef.current;
    if (
      storedPaymentStatus === PaymentStatus.Cancelled ||
      storedPaymentStatus === PaymentStatus.Failed
    ) {
      // Reset all payment-related state
      setSelectedPayment("");
      setSelectedPaymentCard(null);
      setPaymentCardToken(null);
      setSavedCardCvv(null);
      setPayfortCardNumber(null);
      setPayfortCvv(null);

      // Clear last card selection cache
      lastCardSelectionRef.current = {
        card: null,
        cvv: null,
        cvvTimestamp: undefined,
        token: null,
      };

      // Clear CVV timestamp from sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("checkout-cvv-timestamp");
      }

      // Invalidate cart query to refresh cart data after refill
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CART.ROOT(locale),
      });
    }
  }, [locale, paymentStatus, queryClient, setSelectedPayment]);

  // Restore selections after cart is refilled and data is loaded
  useEffect(() => {
    // Only restore if we're on checkout page
    if (pathname !== ROUTES.CHECKOUT.ROOT) {
      return;
    }

    // Use ref value since paymentStatus might have been cleared by usePaymentStatusError
    const storedPaymentStatus = paymentStatusRef.current;

    // Early return if no payment status stored (normal checkout flow)
    // This prevents unnecessary processing and logging
    if (!storedPaymentStatus) {
      return;
    }

    // Only proceed if payment status is Cancelled or Failed
    if (
      storedPaymentStatus !== PaymentStatus.Cancelled &&
      storedPaymentStatus !== PaymentStatus.Failed
    ) {
      return;
    }

    if (
      cart?.id &&
      !isCartLoading &&
      addresses.length > 0 &&
      !hasRestoredSelectionsRef.current
    ) {
      hasRestoredSelectionsRef.current = true;
      restoreSelections().catch((error) => {
        console.error("[CheckoutPage] Error in restoreSelections:", error);
        // Reset flag on error so user can try again
        hasRestoredSelectionsRef.current = false;
      });
    }

    // Reset the flag and ref when payment status is cleared (after restore)
    if (
      paymentStatus !== PaymentStatus.Cancelled &&
      paymentStatus !== PaymentStatus.Failed &&
      paymentStatusRef.current
    ) {
      // Only reset if we've already restored
      if (hasRestoredSelectionsRef.current) {
        paymentStatusRef.current = null;
        hasRestoredSelectionsRef.current = false;
      }
    }
  }, [
    paymentStatus,
    cart?.id,
    isCartLoading,
    addresses.length,
    shippingMethods.length,
    hasReceivedShippingMethods,
    restoreSelections,
    pathname,
  ]);

  useEffect(() => {
    if (customerInfo || isCustomerLoading || currentCustomer || isAuthorized) {
      return;
    }
    if (hasPromptedLoginRef.current) return;
    hasPromptedLoginRef.current = true;

    if (isMobile) {
      router.replace(ROUTES.CUSTOMER.LOGIN);
    } else {
      showOtpLoginPopup();
    }
  }, [
    customerInfo,
    currentCustomer,
    isAuthorized,
    isCustomerLoading,
    isMobile,
    router,
    showOtpLoginPopup,
  ]);

  useEffect(() => {
    setAddresses(initialAddresses);
    previousAddressIdsRef.current = new Set(
      initialAddresses.map((addr) => addr.id)
    );

    setSelectedAddressId((prev) => {
      if (prev && initialAddresses.some((address) => address.id === prev)) {
        return prev;
      }

      const defaultAddressIdFromStorage =
        typeof window !== "undefined"
          ? window.localStorage.getItem("checkout-default-address-id")
          : null;

      if (
        defaultAddressIdFromStorage &&
        initialAddresses.some(
          (address) => address.id === defaultAddressIdFromStorage
        )
      ) {
        return defaultAddressIdFromStorage;
      }

      const defaultAddress = initialAddresses.find(
        (address) => address.isDefault
      );

      return defaultAddress ? defaultAddress.id : null;
    });
  }, [initialAddresses]);

  // Extract cart ID for dependency tracking
  const cartId = cart?.id ?? null;

  // Detect cart item changes (add/remove/update quantity) to reset delivery + payment selections.
  // We intentionally ignore totals/shipping fee changes so the sticky button doesn't thrash.
  const cartItemsSignature = useMemo(() => {
    const items = (cart?.items ?? []).filter((item) => !item.isGwp);
    if (items.length === 0) return "";

    return items
      .map((item) => `${String(item.id)}:${String(item.quantity ?? 0)}`)
      .sort()
      .join("|");
  }, [cart?.items]);
  const previousCartItemsSignatureRef = useRef<null | string>(null);
  const cartSignatureStorageKey = useMemo(() => {
    if (!cartId) return null;
    return `checkout-cart-items-signature:${cartId}`;
  }, [cartId]);

  // Track cart ID changes to detect new cart after order and reset selections
  useEffect(() => {
    if (cartId) {
      // If cart ID changed and we had a previous cart ID, it's a new cart after order
      if (previousCartIdRef.current && previousCartIdRef.current !== cartId) {
        // Reset selections for new cart
        setSelectedDelivery("");
        setSelectedPayment("");
        setSelectedPaymentCard(null);
        setPaymentCardToken(null);
        setSavedCardCvv(null);
        setPayfortCardNumber(null);
        setPayfortCvv(null);
      }
      // Update tracked cart ID
      previousCartIdRef.current = cartId;
    }
  }, [cartId, setSelectedPayment]);

  // Enforce dependency: payment selection must not persist without a delivery selection.
  useEffect(() => {
    // Don't clear payment if we're in the middle of restoring selections
    if (isRestoringSelectionsRef.current || isRestoringCardRef.current) {
      return;
    }

    if (!selectedDelivery && selectedPayment) {
      setSelectedPayment("");
      setSelectedPaymentCard(null);
      setPaymentCardToken(null);
      setSavedCardCvv(null);
      setPayfortCardNumber(null);
      setPayfortCvv(null);
    }
  }, [selectedDelivery, selectedPayment, setSelectedPayment]);

  useEffect(() => {
    if (!cartId) return;

    const resetSelections = () => {
      // Prevent "auto-apply payment from cart" after a cart change.
      hasAppliedPaymentFromCartRef.current = true;

      setSelectedDelivery("");
      setSelectedPayment("");
      setSelectedPaymentCard(null);
      setPaymentCardToken(null);
      setSavedCardCvv(null);
      setPayfortCardNumber(null);
      setPayfortCvv(null);
      // Always reset shipping methods state when cart changes (if cart has items and address is selected)
      // This ensures methods reload quickly after cart change
      // Don't clear methods if locker address is selected - the locker address logic handles it
      if (
        cart?.items &&
        cart.items.length > 0 &&
        selectedAddressId &&
        !selectedLockerAddressType
      ) {
        setHasReceivedShippingMethods(false);
        setShippingMethods([]);
        // Set loading state to trigger the shipping address effect
        if (!isLoadingShippingMethods) {
          setIsLoadingShippingMethods(true);
        }
      }

      lastCardSelectionRef.current = {
        card: null,
        cvv: null,
        cvvTimestamp: undefined,
        token: null,
      };

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("checkout-cvv-timestamp");
      }
    };

    // If the cart changed while we were away from checkout (e.g. user updated quantity on cart page),
    // detect it using a persisted signature and reset selections on mount.
    if (typeof window !== "undefined" && cartSignatureStorageKey) {
      const storedSignature = sessionStorage.getItem(cartSignatureStorageKey);
      if (storedSignature !== null && storedSignature !== cartItemsSignature) {
        resetSelections();
      }
      sessionStorage.setItem(cartSignatureStorageKey, cartItemsSignature);
    }

    // Also handle cart changes while the checkout page is mounted.
    if (previousCartItemsSignatureRef.current === null) {
      previousCartItemsSignatureRef.current = cartItemsSignature;
      return;
    }

    if (previousCartItemsSignatureRef.current !== cartItemsSignature) {
      previousCartItemsSignatureRef.current = cartItemsSignature;
      resetSelections();
    }
  }, [
    cartId,
    cartItemsSignature,
    cartSignatureStorageKey,
    cart,
    isLoadingShippingMethods,
    selectedAddressId,
    selectedLockerAddressType,
    setSelectedPayment,
  ]);

  // Check CVV expiration on mount and clear if stale
  useEffect(() => {
    const checkCvvExpiration = () => {
      // Check CVV in state
      if (savedCardCvv) {
        const cvvTimestamp = lastCardSelectionRef.current.cvvTimestamp;
        if (cvvTimestamp && Date.now() - cvvTimestamp > CVV_EXPIRATION_TIME) {
          setSavedCardCvv(null);
          lastCardSelectionRef.current.cvv = null;
          lastCardSelectionRef.current.cvvTimestamp = undefined;
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("checkout-cvv-timestamp");
          }
        }
      }
    };

    checkCvvExpiration();
  }, [savedCardCvv, CVV_EXPIRATION_TIME]);

  // Clear CVV when page is unloaded (user closes tab/browser)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear CVV from sessionStorage and state
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("checkout-cvv-timestamp");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Redirect to cart page if cart becomes empty (last item deleted)
  useEffect(() => {
    if (cart) {
      // Filter out gift items (GWP) to check actual cart items
      const nonGiftItems = cart.items.filter((item) => !item.isGwp);
      // If no items left (excluding gifts), redirect to cart page
      if (nonGiftItems.length === 0) {
        router.replace(ROUTES.CART.ROOT);
      }
    }
  }, [cart, router]);

  const selectedAddress = useMemo(() => {
    if (!selectedAddressId) return null;
    return (
      addresses.find((address) => address.id === selectedAddressId) ?? null
    );
  }, [addresses, selectedAddressId]);

  const selectedAddressDisplay = useMemo<CustomerAddress | null>(() => {
    if (!selectedAddress) return null;
    return {
      customerAddress: selectedAddress.customerAddress
        ? {
            ...(selectedAddress.customerAddress as any),
            countryCode: selectedAddress.customerAddress.countryCode,
            countryLabel: selectedAddress.customerAddress.countryLabel,
          }
        : undefined,
      formattedAddress: selectedAddress.formattedAddress,
      id: selectedAddress.id,
      isDefault: selectedAddress.isDefault,
      name: selectedAddress.name,
      phoneNumber: selectedAddress.phoneNumber,
    };
  }, [selectedAddress]);

  // Get country label from translations
  const tRegion = useTranslations("RegionPage.countryNames");
  const { language } = useLocaleInfo();

  // Convert cart shipping address to CustomerAddress format when locker address is set
  const lockerAddressDisplay = useMemo<CustomerAddress | null>(() => {
    if (!selectedLockerAddressType || !cart?.shippingAddress) {
      return null;
    }

    const shippingAddress = cart.shippingAddress;
    if (
      !shippingAddress.city ||
      !shippingAddress.firstname ||
      !shippingAddress.country?.code
    ) {
      return null;
    }

    // Retrieve locker info from session storage
    const lockerInfo = getLockerInfo();

    // Format address (without locker name - it will be shown separately)
    const formattedAddress = [
      shippingAddress.city,
      shippingAddress.region?.label || shippingAddress.region?.code || "",
      ...(shippingAddress.street?.filter(
        (s): s is string => typeof s === "string" && s !== null
      ) ?? []),
      shippingAddress.postcode || "",
    ]
      .filter((part) => part && part.trim().length > 0)
      .join(", ");

    const name = [shippingAddress.firstname, shippingAddress.lastname]
      .filter(Boolean)
      .join(" ");

    // Get proper country label from translations, fallback to code if not found
    const countryCode = shippingAddress.country?.code || "";
    const countryLabelFromApi = shippingAddress.country?.label || "";
    const countryLabel =
      countryLabelFromApi && countryLabelFromApi !== countryCode
        ? countryLabelFromApi
        : tRegion.has(countryCode as any)
          ? tRegion(countryCode as any)
          : countryCode;

    return {
      customerAddress: {
        countryCode,
        countryLabel,
      },
      formattedAddress,
      id: "cart-shipping-address",
      isDefault: false,
      lockerInfo: lockerInfo
        ? {
            lockerAddress:
              language === "ar" && lockerInfo.lockerAddressAr
                ? lockerInfo.lockerAddressAr
                : lockerInfo.lockerAddress,
            lockerName:
              language === "ar" && lockerInfo.lockerNameAr
                ? lockerInfo.lockerNameAr
                : lockerInfo.lockerName,
            lockerType: lockerInfo.lockerType,
            pointName: lockerInfo.pointName,
          }
        : undefined,
      name,
      phoneNumber: shippingAddress.telephone?.replace(/^\+/, "") || "",
    };
  }, [selectedLockerAddressType, cart?.shippingAddress, tRegion, language]);

  // Use locker address display if available, otherwise use selected address display
  const addressToDisplay = useMemo<CustomerAddress | null>(() => {
    if (lockerAddressDisplay) {
      return lockerAddressDisplay;
    }
    return selectedAddressDisplay;
  }, [lockerAddressDisplay, selectedAddressDisplay]);

  // Show loader if cart is loading and we have a locker address type but cart shipping address isn't ready yet
  const isWaitingForLockerAddress = useMemo(() => {
    return (
      isCartLoading && !!selectedLockerAddressType && !cart?.shippingAddress
    );
  }, [isCartLoading, selectedLockerAddressType, cart?.shippingAddress]);

  useEffect(() => {
    if (selectedAddressId) {
      window.localStorage.setItem(
        "checkout-default-address-id",
        selectedAddressId
      );
    }
  }, [selectedAddressId]);

  // Reset delivery and payment when address changes (excluding initial mount)
  const previousAddressIdRef = useRef<null | string>(null);
  useEffect(() => {
    // Skip on initial mount (when previousAddressIdRef is null and selectedAddressId is set)
    // Also skip if we're currently restoring selections from cart
    if (
      previousAddressIdRef.current !== null &&
      previousAddressIdRef.current !== selectedAddressId &&
      selectedAddressId &&
      !isRestoringSelectionsRef.current
    ) {
      setSelectedDelivery("");
      setSelectedPayment("");
    }
    // Update ref to track current address
    previousAddressIdRef.current = selectedAddressId;
  }, [selectedAddressId, setSelectedPayment]);

  useEffect(() => {
    if (pathname !== ROUTES.CHECKOUT.ROOT) {
      return;
    }

    if (isSettingShippingMethodRef.current) {
      return;
    }

    // If locker address is selected, skip early return checks and go directly to locker logic
    // This ensures locker address logic runs even if address hasn't changed
    if (selectedLockerAddressType) {
      // For locker addresses, track cart items changes and reset ref to allow logic to run
      const cartItemsCount = cart?.items?.length || 0;
      previousCartItemsRef.current = cartItemsCount;
      // Reset the ref to allow locker address logic to run
      isSettingShippingAddressRef.current = false;
    } else {
      // CRITICAL: Check if we're already setting the address FIRST
      // This prevents duplicate calls when cart updates trigger the effect again
      const wasAlreadySetting = isSettingShippingAddressRef.current;
      const addressChanged =
        previousSelectedAddressIdRef.current !== selectedAddressId;
      // Address is actually different if: it changed AND we have a previous address (not initial load)
      const addressActuallyChanged =
        addressChanged && previousSelectedAddressIdRef.current !== null;
      // On initial load, previousSelectedAddressIdRef.current is null, so we need to allow the call
      const isInitialLoad = previousSelectedAddressIdRef.current === null;

      // Prevent re-running if only cart changed but address is the same
      // IMPORTANT: Check cartItemsChanged BEFORE updating the ref, otherwise the change won't be detected
      const cartItemsCount = cart?.items?.length || 0;
      const cartItemsChanged = previousCartItemsRef.current !== cartItemsCount;
      // Only update the ref AFTER we've checked for changes, but BEFORE we use it in early returns
      // This ensures cart item changes are properly detected

      // If we're already setting the address AND the address hasn't actually changed to a different value, skip
      // BUT allow initial load to proceed (when previousSelectedAddressIdRef.current is null)
      // AND allow cart item changes to proceed (cart item changes require shipping method refresh)
      // This prevents duplicate calls on initial load when cart updates after the first API call
      if (
        wasAlreadySetting &&
        !addressActuallyChanged &&
        !isInitialLoad &&
        !cartItemsChanged
      ) {
        return;
      }
    }

    // Set the ref to prevent concurrent calls
    // Reset if address actually changed to a different value (not just from null to a value on initial load)
    // Skip this for locker addresses - they need to run regardless
    if (!selectedLockerAddressType) {
      const addressChanged =
        previousSelectedAddressIdRef.current !== selectedAddressId;
      const addressActuallyChanged =
        addressChanged && previousSelectedAddressIdRef.current !== null;
      const cartItemsCount = cart?.items?.length || 0;
      const cartItemsChanged = previousCartItemsRef.current !== cartItemsCount;

      if (addressActuallyChanged) {
        isSettingShippingAddressRef.current = false;
      }

      isSettingShippingAddressRef.current = true;

      // Skip if address hasn't changed AND we already have shipping methods AND cart items haven't changed
      // On initial load (previousSelectedAddressIdRef.current is null), we need to call the API
      // IMPORTANT: Only skip if address hasn't changed AND we have a previous address ID (not initial load)
      // AND cart items haven't changed (cart item changes require shipping method refresh)
      if (
        !addressChanged &&
        !cartItemsChanged &&
        selectedAddressId &&
        previousSelectedAddressIdRef.current &&
        hasReceivedShippingMethods &&
        shippingMethods.length > 0
      ) {
        // Reset ref since we're returning early
        isSettingShippingAddressRef.current = false;
        // Update the ref AFTER we've checked for changes and decided to return early
        previousCartItemsRef.current = cartItemsCount;
        return;
      }

      // Update the ref AFTER we've checked for changes and decided to proceed
      previousCartItemsRef.current = cartItemsCount;
    } else {
      // For locker addresses, always allow the logic to run
      isSettingShippingAddressRef.current = true;
    }

    if (!cart?.items || cart.items.length === 0) {
      setIsLoadingShippingMethods(false);
      return;
    }

    // If locker address is displayed, show only the selected locker shipping method
    if (selectedLockerAddressType) {
      // Wait for cart to be updated with shipping address after locker address is added
      if (!cart?.shippingAddress) {
        // Set loading state and wait for cart to update
        if (!hasReceivedShippingMethods) {
          setIsLoadingShippingMethods(true);
        }
        return;
      }

      const selectedMethod = cart.shippingAddress.selected_shipping_method;

      if (selectedMethod) {
        // Helper function to map short carrier/method codes to full codes
        const mapShippingCode = (code: string): string => {
          const lowerCode = code.toLowerCase();
          if (
            lowerCode === "flatrate" ||
            lowerCode === "flat_rate" ||
            lowerCode === "flaterate"
          ) {
            return "lambdashipping_flatrate";
          }
          if (lowerCode.startsWith("lambdashipping_")) {
            return code;
          }
          return code;
        };

        const priceValue = selectedMethod?.amount?.value ?? 0;
        const currency = selectedMethod?.amount?.currency;
        const rawCarrierCode = selectedMethod?.carrier_code ?? "";
        const rawMethodCode = selectedMethod?.method_code ?? "";

        // Map carrier code: if it's a short code like "flatrate", map to "lambdashipping"
        // Map method code: keep as is (e.g., "flatrate" stays "flatrate")
        let carrierCode = mapShippingCode(rawCarrierCode);
        let methodCode = rawMethodCode;

        // If carrier code was mapped to "lambdashipping_flatrate", split it
        if (carrierCode.startsWith("lambdashipping_")) {
          const methodPart = carrierCode.replace("lambdashipping_", "");
          carrierCode = "lambdashipping";
          // Only use methodPart if methodCode is empty or same as carrierCode
          if (!methodCode || methodCode === rawCarrierCode) {
            methodCode = methodPart;
          }
        }

        // Get estimated delivery days from store config
        let estimatedTime = undefined;
        if (storeConfig?.estimatedDeliveryDays) {
          const isArabic = locale.toLowerCase().startsWith("ar");
          const fullMethodCode = `${carrierCode}_${methodCode}`;
          const methodId = `${carrierCode}-${methodCode}`;

          for (const item of storeConfig.estimatedDeliveryDays) {
            const daysText = isArabic
              ? item.days_ar || item.days_en || ""
              : item.days_en || item.days_ar || "";
            if (
              daysText &&
              (item.method === fullMethodCode || item.method === methodId)
            ) {
              estimatedTime = daysText;
              break;
            }
          }
        }

        const lockerShippingMethod: DeliveryMethod = {
          carrier_code: carrierCode,
          carrier_title: selectedMethod?.carrier_title ?? undefined,
          currency: currency ?? undefined,
          estimatedTime,
          id: `${carrierCode}-${methodCode}`,
          method_code: methodCode,
          name:
            selectedMethod?.method_title ??
            selectedMethod?.carrier_title ??
            rawCarrierCode ??
            "Shipping",
          price: (priceValue > 0 ? Number(priceValue) : "free") as
            | "free"
            | number,
        };

        setShippingMethods([lockerShippingMethod]);
        // Auto-select the locker shipping method only if cart ID hasn't changed (not a new cart after order)
        if (
          previousCartIdRef.current === cart?.id ||
          !previousCartIdRef.current
        ) {
          setSelectedDelivery(lockerShippingMethod.id);
        }
      } else {
        // If selectedMethod is not available yet, don't set empty methods
        // The effect will run again when cart updates after invalidateQueries
        // Set loading state to indicate we're waiting for cart to update
        if (!hasReceivedShippingMethods) {
          setIsLoadingShippingMethods(true);
        }
        // Don't set empty methods - wait for cart to update
        // The effect will re-run when cart updates (cart is in dependencies)
        return;
      }

      setHasReceivedShippingMethods(true);
      setIsLoadingShippingMethods(false);
      setIsSettingShippingAddress(false);
      setIsSettingBillingAddress(false);

      // Get payment methods from cart (already set when locker address was added)
      const cartPaymentMethods = cart?.availablePaymentMethods ?? [];
      setAvailablePaymentMethods(
        cartPaymentMethods
          .filter((method) => method?.code)
          .map((method) => ({
            code: method.code!,
            downtime_alert: method.downtime_alert ?? null,
            title: method.title ?? method.code!,
          }))
      );

      return;
    }

    // If no address is selected (neither regular nor locker), clear shipping methods
    if (!selectedAddressId && !selectedLockerAddressType) {
      setShippingMethods([]);
      setIsLoadingShippingMethods(false);
      setHasReceivedShippingMethods(false);
      setSelectedDelivery("");
      setAvailablePaymentMethods([]);
      return;
    }

    // If locker address is selected, don't run regular address logic
    // The locker address logic above already handled setting the shipping methods
    if (selectedLockerAddressType) {
      return;
    }

    if (!selectedAddressId) {
      return;
    }

    // Double-check cart has items before attempting to set shipping address
    if (!cart?.items || cart.items.length === 0) {
      return;
    }

    // Skip API call if we're currently restoring selections from cart refill
    if (isRestoringSelectionsRef.current) {
      return;
    }
    if (
      hasRestoredSelectionsRef.current &&
      cart?.shippingAddress?.available_shipping_methods &&
      cart.shippingAddress.available_shipping_methods.length > 0 &&
      hasReceivedShippingMethods &&
      shippingMethods.length > 0
    ) {
      return;
    }

    let isActive = true;

    if (!hasReceivedShippingMethods || shippingMethods.length === 0) {
      setIsLoadingShippingMethods(true);
    }

    setIsSettingShippingAddress(true);

    // Safety timeout: reset flag after 30 seconds if operation hangs
    const timeoutId = setTimeout(() => {
      if (isActive) {
        setIsSettingShippingAddress(false);
        setIsSettingBillingAddress(false);
        setIsLoadingShippingMethods(false);
        setHasReceivedShippingMethods(true);
      }
    }, 30000);

    (async () => {
      try {
        const shippingResult = await setShippingAddressOnCartAction({
          customerAddressId: selectedAddressId,
        });

        // Clear timeout since operation completed
        clearTimeout(timeoutId);

        if (!isActive) {
          return;
        }

        if (!isOk(shippingResult)) {
          isSettingShippingAddressRef.current = false;
          setIsLoadingShippingMethods(false);
          setHasReceivedShippingMethods(true);
          setIsSettingShippingAddress(false);
          showError(
            shippingResult.error || "Failed to set shipping address",
            " "
          );
          return;
        }

        const availableMethods =
          shippingResult.data?.availableShippingMethods ?? [];

        const paymentMethodsFromBackend =
          shippingResult.data?.availablePaymentMethods ?? [];

        // For gift delivery, use default address as billing, otherwise use selected address
        const isGiftDelivery = selectedShippingOption === "gift_delivery";
        const defaultAddress = addresses.find((addr) => addr.isDefault);
        const billingAddressId = isGiftDelivery
          ? defaultAddress?.id || selectedAddressId
          : selectedAddressId;

        // Only set billing address if we're not already setting it
        // This prevents duplicate calls when the shipping address effect runs multiple times
        if (!isSettingBillingAddressRef.current) {
          isSettingBillingAddressRef.current = true;
          setIsSettingBillingAddress(true);

          let billingResult;

          // For gift delivery, build billing address with current user's info instead of using customerAddressId
          if (isGiftDelivery && selectedAddress && currentCustomer) {
            const customerAddr =
              selectedAddress.customerAddress as CustomerAddressModel;

            const billingAddress: CartAddressInput = {
              address_label: "home",
              city: customerAddr?.city || "",
              country_code: customerAddr?.countryCode || "",
              firstname: currentCustomer.firstName || "",
              lastname: currentCustomer.lastName || "",
              postcode: customerAddr?.postcode || "",
              region: customerAddr?.regionName || undefined,
              region_id: customerAddr?.regionId || undefined,
              street: customerAddr?.street || [],
              telephone: currentCustomer.phoneNumber || "",
            };

            billingResult = await setBillingAddressOnCartAction({
              address: billingAddress,
            });
          } else {
            // Regular delivery: use customerAddressId
            billingResult = await setBillingAddressOnCartAction({
              customerAddressId: billingAddressId,
            });
          }

          isSettingBillingAddressRef.current = false;
          setIsSettingBillingAddress(false);
          if (!isOk(billingResult)) {
            showError(
              billingResult.error ?? t("errors.failedToSetBillingAddress"),
              " "
            );
            // Continue processing shipping methods even if billing fails
          }
        }

        // Helper function to optimize Map lookups (try most likely matches first)
        const getEstimatedDays = (
          fullMethodCode: string,
          methodCode: string,
          carrierCode: string,
          methodId: string,
          rawMethodCode: string,
          rawCarrierCode: string,
          rawMethodId: string
        ): string | undefined => {
          // Try most specific matches first (most likely to succeed)
          return (
            estimatedDeliveryDaysMap.get(fullMethodCode) ||
            estimatedDeliveryDaysMap.get(methodId) ||
            estimatedDeliveryDaysMap.get(methodCode) ||
            estimatedDeliveryDaysMap.get(carrierCode) ||
            estimatedDeliveryDaysMap.get(rawMethodId) ||
            estimatedDeliveryDaysMap.get(rawMethodCode) ||
            estimatedDeliveryDaysMap.get(rawCarrierCode)
          );
        };

        // Single-pass processing: combine filter and map for better performance
        const normalizedMethods: DeliveryMethod[] = [];
        for (const method of availableMethods) {
          // Early filter: skip invalid methods
          if (!method) continue;

          const priceValue = method?.amount?.value ?? 0;
          const currency = method?.amount?.currency;
          const rawCarrierCode = method?.carrier_code ?? "";
          const rawMethodCode = method?.method_code ?? "";

          // Map to full codes for API calls
          const carrierCode = mapShippingCode(rawCarrierCode);
          const methodCode = mapShippingCode(rawMethodCode);

          // Pre-compute method identifiers (used multiple times)
          const fullMethodCode = `${carrierCode}_${methodCode}`;
          const methodId = `${carrierCode}-${methodCode}`;
          const rawMethodId = `${rawCarrierCode}-${rawMethodCode}`;
          const methodIdLower = methodId.toLowerCase();

          // Early filter: exclude redbox and fodel methods before processing
          if (
            methodIdLower.includes("fodel") ||
            methodIdLower.includes("redbox")
          ) {
            continue;
          }

          // Get estimated delivery time (try in order of likelihood)
          let estimatedTime = method?.delivery_time ?? undefined;

          if (!estimatedTime) {
            const methodWithShippingFields = method as {
              shipping_days_max?: number;
              shipping_days_min?: number;
              shipping_time?: string;
            } & typeof method;

            // Try shipping_time
            estimatedTime =
              methodWithShippingFields?.shipping_time ?? undefined;

            // Try constructing from shipping_days_min and shipping_days_max
            if (
              !estimatedTime &&
              (methodWithShippingFields?.shipping_days_max ||
                methodWithShippingFields?.shipping_days_min)
            ) {
              const minDays = methodWithShippingFields?.shipping_days_min;
              const maxDays = methodWithShippingFields?.shipping_days_max;
              if (minDays && maxDays) {
                estimatedTime = t("delivery.days", {
                  days: `${minDays}–${maxDays}`,
                });
              } else if (minDays) {
                estimatedTime = t("delivery.days", { days: `${minDays}+` });
              } else if (maxDays) {
                estimatedTime = t("delivery.days", { days: `≤${maxDays}` });
              }
            }

            // Try store config map (optimized lookup order)
            if (!estimatedTime) {
              estimatedTime = getEstimatedDays(
                fullMethodCode,
                methodCode,
                carrierCode,
                methodId,
                rawMethodCode,
                rawCarrierCode,
                rawMethodId
              );
            }
          }

          normalizedMethods.push({
            carrier_code: carrierCode,
            carrier_title: method?.carrier_title,
            currency: currency ?? undefined,
            estimatedTime,
            id: methodId,
            method_code: methodCode,
            name:
              method?.method_title ??
              method?.carrier_title ??
              rawCarrierCode ??
              "Shipping",
            price: (priceValue > 0 ? Number(priceValue) : "free") as
              | "free"
              | number,
          });
        }

        // Update state in optimal order: methods first, then loading state
        // This ensures skeleton disappears immediately when methods are available
        setShippingMethods(normalizedMethods);
        setHasReceivedShippingMethods(true);
        setIsLoadingShippingMethods(false); // Skeleton loader will hide immediately

        // Set payment methods AFTER shipping methods are processed
        // This ensures shipping methods appear first, then payment methods
        setAvailablePaymentMethods(
          paymentMethodsFromBackend
            .filter((method) => method?.code)
            .map((method) => ({
              code: method.code!,
              downtime_alert: method.downtime_alert ?? null,
              title: method.title ?? method.code!,
            }))
        );

        // Mark that delivery methods just finished loading to prevent immediate toast
        deliveryMethodsJustLoadedRef.current = true;
        setTimeout(() => {
          deliveryMethodsJustLoadedRef.current = false;
        }, 1000); // Clear flag after 1 second

        // Invalidate cart query to update shipping address for bullet delivery components
        // This ensures bullet delivery components get the updated cart with new shipping address
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CART.ROOT(locale),
        });

        // Update previousSelectedAddressIdRef AFTER successful API call
        // This ensures that if the effect runs again before this completes,
        // it will see addressChanged as true and proceed
        previousSelectedAddressIdRef.current = selectedAddressId;

        // Clear the ref flag before setting state (allows next run if address actually changes)
        isSettingShippingAddressRef.current = false;
        setIsLoadingShippingMethods(false);
        setHasReceivedShippingMethods(true);
        setIsSettingShippingAddress(false);

        // Only clear selected delivery if it's no longer available
        if (selectedDelivery) {
          const isStillAvailable = normalizedMethods.some(
            (method) => method.id === selectedDelivery
          );
          if (!isStillAvailable) {
            setSelectedDelivery("");
          }
        }
      } catch (error) {
        // Clear timeout on error
        clearTimeout(timeoutId);
        throw error; // Re-throw to be caught by outer catch
      }
    })().catch((error) => {
      if (!isActive) {
        return;
      }

      console.error(
        "[CheckoutPage] Failed to set shipping address on cart:",
        error
      );

      isSettingShippingAddressRef.current = false;
      setIsLoadingShippingMethods(false);
      setHasReceivedShippingMethods(true);
      setIsSettingShippingAddress(false);
      setIsSettingBillingAddress(false); // Also reset billing address flag in case it was stuck
      showError(t("errors.failedToUpdateShippingAddress"), " ");
    });

    return () => {
      isActive = false;
      clearTimeout(timeoutId); // Clear timeout on cleanup
      // DO NOT reset isSettingShippingAddressRef here - it should only be reset
      // when the async operation completes or errors, not when the effect re-runs.
      // Resetting it here causes race conditions where the cleanup runs before
      // the new effect run sets the ref, allowing duplicate API calls.
      setIsSettingShippingAddress(false);
      setIsSettingBillingAddress(false);
      setIsLoadingShippingMethods(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addresses,
    cart,
    selectedLockerAddressType,
    locale,
    selectedAddressId,
    selectedShippingOption,
    showError,
    storeConfig?.estimatedDeliveryDays,
    t,
    pathname,
    // Note: selectedDelivery is intentionally not in dependencies
    // We only want to validate it when shipping methods change, not rerun the effect when it changes
  ]);

  // Call setShippingMethodsOnCart when a delivery method is selected (either default or user selection)
  useEffect(() => {
    if (!selectedDelivery || !selectedAddressId) {
      return;
    }

    // Skip if we're already setting the shipping method to prevent duplicate calls
    if (isSettingShippingMethodRef.current) {
      return;
    }

    // Skip if locker address is selected and shipping method is already set on cart
    // The shipping method is set when the locker address is added, so no need to set it again
    if (
      selectedLockerAddressType &&
      cart?.shippingAddress?.selected_shipping_method
    ) {
      return;
    }

    // Check if cart has items before setting shipping method
    if (!cart?.items || cart.items.length === 0) {
      return;
    }

    // Wait for shipping methods to be loaded before making API call
    if (shippingMethods.length === 0) {
      return;
    }

    // Find the selected method from shippingMethods to get carrier_code and method_code
    const selectedMethod = shippingMethods.find(
      (method) => method.id === selectedDelivery
    );

    if (!selectedMethod) {
      return;
    }

    if (!selectedMethod.carrier_code || !selectedMethod.method_code) {
      return;
    }

    // At this point, TypeScript knows carrier_code and method_code are defined
    const carrierCode = selectedMethod.carrier_code;
    const methodCode = selectedMethod.method_code;
    const targetMethodId = `${carrierCode}-${methodCode}`;

    // Check if the cart already has this shipping method set to avoid unnecessary API calls
    const cartSelectedMethod = cart?.shippingAddress?.selected_shipping_method;
    const cartMethodId = cartSelectedMethod
      ? `${cartSelectedMethod.carrier_code}-${cartSelectedMethod.method_code}`
      : null;

    // Skip if the cart already has the correct shipping method set
    if (cartMethodId === targetMethodId) {
      lastSetShippingMethodRef.current = targetMethodId;
      return;
    }

    // Skip if we're already setting this exact method (prevent duplicate calls)
    if (
      lastSetShippingMethodRef.current === targetMethodId &&
      isSettingShippingMethodRef.current
    ) {
      return;
    }

    // Set flag BEFORE async call to prevent race conditions
    isSettingShippingMethodRef.current = true;
    lastSetShippingMethodRef.current = targetMethodId;
    setIsSettingShippingMethod(true);

    let isActive = true;

    (async () => {
      const result = await setShippingMethodsOnCartAction({
        carrierCode,
        methodCode,
      });

      setTimeout(() => {
        isSettingShippingMethodRef.current = false;
      }, 500);

      if (!isActive) {
        setIsSettingShippingMethod(false);
        return;
      }

      if (!isOk(result)) {
        setIsSettingShippingMethod(false);
        // Clear the ref on error so we can retry
        isSettingShippingMethodRef.current = false;
        lastSetShippingMethodRef.current = null;
        if (
          methodCode.includes("fodel") ||
          methodCode.includes("redbox") ||
          methodCode.includes("red_box")
        ) {
          return;
        }
        showError(result.error ?? t("errors.failedToSetShippingMethod"), " ");
        return;
      }

      // Invalidate cart cache to update prices (shipping fee, totals, etc.)
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CART.ROOT(locale),
      });

      setIsSettingShippingMethod(false);
      // Keep the ref set until timeout to prevent re-runs during cart update
    })().catch((error) => {
      // Reset flag on error with delay
      setTimeout(() => {
        isSettingShippingMethodRef.current = false;
        // Clear on error so we can retry
        lastSetShippingMethodRef.current = null;
      }, 500);
      setIsSettingShippingMethod(false);

      if (!isActive) {
        return;
      }

      console.error("Failed to set shipping method on cart:", error);
      showError(t("errors.failedToUpdateShippingMethod"), " ");
    });

    return () => {
      isActive = false;
      // Reset loading flag on cleanup to prevent stuck states
      setIsSettingShippingMethod(false);
      isSettingShippingMethodRef.current = false;
    };
  }, [
    cart?.items,
    cart?.shippingAddress?.selected_shipping_method,
    locale,
    queryClient,
    selectedAddressId,
    selectedDelivery,
    selectedLockerAddressType,
    shippingMethods,
    showError,
    storeConfig?.estimatedDeliveryDays,
    t,
  ]);

  // Watch for mokafaa discount and coupon changes and refresh payment methods
  const mokafaaDiscount = cart?.mokafaaDiscount || 0;
  const appliedCoupons = cart?.appliedCoupons || [];
  const appliedCouponsString = appliedCoupons.join(",");

  // Track previous values to prevent infinite loops
  const prevMokafaaRef = useRef<number>(mokafaaDiscount);
  const prevCouponsRef = useRef<string>(appliedCouponsString);

  useEffect(() => {
    // Only refresh if we have a selected address (payment methods depend on billing address)
    if (!selectedAddressId) return;

    // Check if values have actually changed (not just object reference)
    const mokafaaChanged = prevMokafaaRef.current !== mokafaaDiscount;
    const couponsChanged = prevCouponsRef.current !== appliedCouponsString;

    if (!mokafaaChanged && !couponsChanged) {
      return;
    }

    // Prevent duplicate calls if we're already setting billing address
    if (isSettingBillingAddressRef.current) {
      return;
    }

    // Update refs
    prevMokafaaRef.current = mokafaaDiscount;
    prevCouponsRef.current = appliedCouponsString;

    // Refresh payment methods when mokafaa or coupons change (especially when removed)
    setIsRefreshingPaymentMethods(true);
    isSettingBillingAddressRef.current = true;
    (async () => {
      // Check if current shipping method is gift delivery
      const currentShippingMethod =
        cart?.shippingAddress?.selected_shipping_method;
      const isCurrentGiftDelivery =
        currentShippingMethod?.method_code === "gift_delivery" ||
        selectedShippingOption === "gift_delivery";

      let billingResult;

      // For gift delivery with current user info, use custom billing address
      if (
        isCurrentGiftDelivery &&
        selectedAddress &&
        currentCustomer &&
        selectedAddressId
      ) {
        const customerAddr =
          selectedAddress.customerAddress as CustomerAddressModel;

        const billingAddress: CartAddressInput = {
          address_label: "home",
          city: customerAddr?.city || "",
          country_code: customerAddr?.countryCode || "",
          firstname: currentCustomer.firstName || "",
          lastname: currentCustomer.lastName || "",
          postcode: customerAddr?.postcode || "",
          region: customerAddr?.regionName || undefined,
          region_id: customerAddr?.regionId || undefined,
          street: customerAddr?.street || [],
          telephone: currentCustomer.phoneNumber || "",
        };

        billingResult = await setBillingAddressOnCartAction({
          address: billingAddress,
        });
      } else {
        // Regular delivery or no current user: use customerAddressId
        billingResult = await setBillingAddressOnCartAction({
          customerAddressId: selectedAddressId,
        });
      }

      if (isOk(billingResult)) {
        const paymentMethodsFromBackend =
          billingResult.data?.availablePaymentMethods ?? [];

        setAvailablePaymentMethods(
          paymentMethodsFromBackend
            .filter((method) => method?.code)
            .map((method) => ({
              code: method.code!,
              downtime_alert: method.downtime_alert ?? null,
              title: method.title ?? method.code!,
            }))
        );

        // Prefetch cards if checkout.com payment method is available
        const hasCheckoutCom = paymentMethodsFromBackend.some((method) =>
          isCheckoutComPaymentMethod(method.code || "")
        );
        if (hasCheckoutCom && !hasPrefetchedCardsRef.current) {
          hasPrefetchedCardsRef.current = true;
          // Prefetch cards in the background
          fetch("/api/customer/payment-cards?nocache=true", {
            cache: "no-store",
          })
            .then((response) => {
              if (response.ok) {
                return response.json();
              }
              return null;
            })
            .then((json) => {
              if (json?.data?.paymentCards) {
                const cards = json.data.paymentCards
                  .filter(
                    (card: PaymentCardData) =>
                      card.sourceId && card.sourceId.trim().length > 0
                  )
                  .map((card: PaymentCardData) => ({
                    bin: card.bin || "",
                    cardNetwork: card.cardNetwork,
                    checkoutPaymentId: card.checkoutPaymentId || null,
                    expiry: card.expiry,
                    id: card.id,
                    isDefault: card.isDefault,
                    isExpired: card.isExpired,
                    last4: card.last4,
                    sourceId: card.sourceId.trim(),
                  }));
                setPrefetchedPaymentCards(cards);
              }
            })
            .catch((error) => {
              console.error("Failed to prefetch payment cards:", error);
            });
        }

        // Clear selected payment if it's no longer available
        // Skip this check during restore to prevent clearing payment method we just set
        if (selectedPayment && !isRestoringSelectionsRef.current) {
          // selectedPayment is now a backend code directly
          const isStillAvailable = paymentMethodsFromBackend.some(
            (method) =>
              method?.code?.toLowerCase() === selectedPayment.toLowerCase()
          );
          if (!isStillAvailable) {
            setSelectedPayment("");
            setSelectedPaymentCard(null);
            setPaymentCardToken(null);
            setSavedCardCvv(null);
          }
        }
      }
      isSettingBillingAddressRef.current = false;
      setIsRefreshingPaymentMethods(false);
    })().catch((error) => {
      console.error("Failed to refresh payment methods:", error);
      isSettingBillingAddressRef.current = false;
      setIsRefreshingPaymentMethods(false);
    });
  }, [
    appliedCouponsString,
    mokafaaDiscount,
    cart?.shippingAddress?.selected_shipping_method,
    currentCustomer,
    selectedAddress,
    selectedAddressId,
    selectedShippingOption,
    selectedPayment,
    setSelectedPayment,
  ]);

  // Map frontend payment method IDs to backend codes
  const getBackendPaymentMethodCode = useCallback(
    (frontendId: string): null | string => {
      // Map frontend IDs to possible backend code patterns (in order of preference)
      const mapping: Record<string, string[]> = {
        cod: [
          "phoenix_cashondelivery",
          "cod",
          "cashondelivery",
          "cash_on_delivery",
        ],
        mada: [
          "checkoutcom_pay",
          "payfortcc",
          "mada",
          "checkoutcom",
          "payfort",
        ],
        tabby: ["tabby_installments", "tabby"],
        tamara: ["pay_by_instalments", "tamara", "paybyinstalments"],
      };

      // First try mapped codes in order of preference
      if (mapping[frontendId]) {
        for (const mappedCode of mapping[frontendId]) {
          const exists = availablePaymentMethods.some(
            (method) => method.code.toLowerCase() === mappedCode.toLowerCase()
          );
          if (exists) {
            // Return the actual code from availablePaymentMethods (preserve case)
            const found = availablePaymentMethods.find(
              (method) => method.code.toLowerCase() === mappedCode.toLowerCase()
            );
            if (found) {
              return found.code;
            }
          }
        }
      }

      // Try to find by matching the frontend ID in the backend codes
      const found = availablePaymentMethods.find((method) => {
        const code = method.code.toLowerCase();
        const lowerFrontendId = frontendId.toLowerCase();
        return (
          code === lowerFrontendId || code.includes(lowerFrontendId)
          // || lowerFrontendId.includes(code.split("_").pop() || "") // not working correctly for tamara
        );
      });

      if (found) {
        return found.code;
      }

      // Fallback: try to find exact match (case-insensitive)
      const exactMatch = availablePaymentMethods.find(
        (method) => method.code.toLowerCase() === frontendId.toLowerCase()
      );
      if (exactMatch) {
        return exactMatch.code;
      }

      return null;
    },
    [availablePaymentMethods]
  );

  // Monitor selected payment method availability and clear if it becomes unavailable
  useEffect(() => {
    if (!selectedPayment || availablePaymentMethods.length === 0) {
      return;
    }

    // Skip during restore to prevent clearing payment method we just set
    if (isRestoringSelectionsRef.current) {
      return;
    }

    // selectedPayment is now a backend code directly
    const isAvailable = availablePaymentMethods.some(
      (method) => method.code.toLowerCase() === selectedPayment.toLowerCase()
    );

    if (!isAvailable) {
      setSelectedPayment("");
      setSelectedPaymentCard(null);
      setPaymentCardToken(null);
      setSavedCardCvv(null);
    }
  }, [
    availablePaymentMethods,
    getBackendPaymentMethodCode,
    selectedPayment,
    setSelectedPayment,
  ]);

  // Function to highlight a section with background color (inline style so it reliably overrides Tailwind bg classes)
  const highlightSection = useCallback((sectionSelector: string, delay = 0) => {
    setTimeout(() => {
      const section = document.querySelector(sectionSelector);
      if (!(section instanceof HTMLElement)) return;

      const previousBackgroundColor = section.style.backgroundColor || "";
      section.style.backgroundColor = "rgba(37, 104, 242, 0.08)";

      // Remove highlight after 500ms
      setTimeout(() => {
        // Restore previous background or clear it if it was empty
        if (previousBackgroundColor) {
          section.style.backgroundColor = previousBackgroundColor;
        } else {
          section.style.backgroundColor = "";
        }
      }, 500);
    }, delay);
  }, []);

  const scrollToSection = useCallback(
    (selector: string) => {
      const section = document.querySelector(selector);
      if (!section) return;

      if (isMobile) {
        const stickyFooterHeight = 142 + 20;
        const elementTop = section.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementTop - stickyFooterHeight;

        window.scrollTo({
          behavior: "smooth",
          top: Math.max(0, offsetPosition),
        });
      } else {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [isMobile]
  );

  const isPlacingOrder = isPlacingOrderPending || isApplePayPlaceOrderPending;

  const handlePaymentMethodChange = useCallback(
    async (frontendPaymentMethodId: string) => {
      // Handle empty string (cancellation/clear) - just clear state without updating cart
      if (!frontendPaymentMethodId) {
        setSelectedPayment("");
        return;
      }

      // Do not allow selecting a payment method before selecting delivery
      if (!selectedDelivery) {
        showError(t("errors.selectDeliveryMethod"), " ");
        scrollToSection('[data-section="delivery-methods"]');
        return;
      }

      // Check if it's a card payment method
      if (requiresCardPaymentSection(frontendPaymentMethodId)) {
        // Set flag to prevent auto-apply from interfering (important for card payments too)
        isSelectingPaymentMethodRef.current = true;

        // CRITICAL: Don't auto-select default card if we're restoring selections
        // The restoration process will handle card selection
        if (isRestoringSelectionsRef.current || isRestoringCardRef.current) {
          setSelectedPayment(frontendPaymentMethodId);
          setTimeout(() => {
            isSelectingPaymentMethodRef.current = false;
          }, 500);
          return;
        }

        // Pre-select card when switching to card payments
        if (!paymentCardToken && !selectedPaymentCard) {
          // Priority 1: Pre-select default card if available
          const defaultCard = initialPaymentCards.find(
            (card) => card.isDefault
          );
          if (
            defaultCard &&
            defaultCard.sourceId &&
            defaultCard.sourceId.length > 0
          ) {
            setSelectedPaymentCard(defaultCard);
            // Don't set token or CVV for saved cards - user will need to enter CVV
          } else if (lastCardSelectionRef.current.card) {
            // Priority 2: Restore last card selection if no default card
            const { card, cvv, cvvTimestamp, token } =
              lastCardSelectionRef.current;
            if (card) {
              setSelectedPaymentCard(card);
            }
            if (token) {
              setPaymentCardToken(token);
            }
            // Only restore CVV if it's not expired
            if (
              cvv &&
              cvvTimestamp &&
              Date.now() - cvvTimestamp <= CVV_EXPIRATION_TIME
            ) {
              setSavedCardCvv(cvv);
            } else {
              // CVV expired or missing - clear it
              setSavedCardCvv(null);
              lastCardSelectionRef.current.cvv = null;
              lastCardSelectionRef.current.cvvTimestamp = undefined;
            }
          }
        }
        setSelectedPayment(frontendPaymentMethodId);

        // Clear flag after a short delay (same as non-card payments)
        setTimeout(() => {
          isSelectingPaymentMethodRef.current = false;
        }, 500);

        return;
      }

      // Clear card-related state when switching to non-card payment
      setSelectedPaymentCard(null);
      setPaymentCardToken(null);
      setSavedCardCvv(null);

      // Set flag to prevent auto-apply from interfering
      isSelectingPaymentMethodRef.current = true;
      setSelectedPayment(frontendPaymentMethodId);

      // Use the payment method code directly (it's already a backend code)
      const backendCode = frontendPaymentMethodId;

      // CRITICAL FIX: Set payment method on cart and WAIT for it to complete
      // This prevents race condition where user places order before payment method is set
      // Set loading state to prevent order placement during payment method update
      setIsRefreshingPaymentMethods(true);

      try {
        const result = await setPaymentMethodOnCartAction({
          paymentMethodCode: backendCode,
        });

        if (!isOk(result)) {
          showError(result.error ?? t("errors.failedToSetPaymentMethod"), " ");
          setIsRefreshingPaymentMethods(false);
          return;
        }

        // Track checkout_payment_method_saved when payment method is saved successfully in cart
        if (cart) {
          const cartProperties = buildCartProperties(cart, { storeConfig });
          trackCheckoutPaymentMethodSaved(cartProperties, backendCode);
        }

        // Invalidate cart cache to update prices (COD fee, totals, etc.)
        // Fire-and-forget: don't await to prevent blocking button state updates
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CART.ROOT(locale),
        });

        // Clear flag after cart update completes
        setTimeout(() => {
          isSelectingPaymentMethodRef.current = false;
          setIsRefreshingPaymentMethods(false);
        }, 300);
      } catch (error) {
        setIsRefreshingPaymentMethods(false);
        // Don't show error if component is unmounting or navigating away
        if (!isMountedRef.current) {
          return;
        }
        console.error("Failed to set payment method on cart:", error);
        // Only show error if it's not a navigation-related error
        if (error instanceof Error && !error.message.includes("abort")) {
          showError(t("errors.failedToUpdatePaymentMethod"), " ");
        }
        // Clear flag on error too
        isSelectingPaymentMethodRef.current = false;
      }
    },
    [
      CVV_EXPIRATION_TIME,
      cart,
      initialPaymentCards,
      locale,
      paymentCardToken,
      queryClient,
      scrollToSection,
      selectedDelivery,
      selectedPaymentCard,
      setSelectedPayment,
      showError,
      storeConfig,
      t,
    ]
  );

  const handleCardTokenReady = useCallback(
    async (
      token: string,
      card?: null | PaymentCardData,
      cardNumber?: string,
      cvv?: string
      // Note: shouldRefreshCards parameter is handled in checkout-card-payment-section
    ) => {
      // CRITICAL: Don't process card updates if order is being placed
      // This prevents race condition where card token ready fires after cart is consumed
      if (isPlacingOrder) {
        return;
      }

      // Handle card deletion case
      if (!token && !card && !cardNumber && !cvv) {
        setPaymentCardToken(null);
        setSelectedPaymentCard(null);
        setSavedCardCvv(null);
        setPayfortCardNumber(null);
        setPayfortCvv(null);
        lastCardSelectionRef.current = {
          card: null,
          cvv: null,
          cvvTimestamp: undefined,
          token: null,
        };
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("checkout-cvv-timestamp");
        }
        return;
      }

      // If card is explicitly null, clear the current selection (do not delete card)
      if (card === null) {
        setSelectedPaymentCard(null);
        setPaymentCardToken("");
        setSavedCardCvv(null);
        setPayfortCardNumber(null);
        setPayfortCvv(null);
        lastCardSelectionRef.current = {
          card: null,
          cvv: null,
          cvvTimestamp: undefined,
          token: null,
        };
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("checkout-cvv-timestamp");
        }
        return;
      }

      // Do not allow selecting a card payment before selecting delivery
      if (!selectedDelivery) {
        showError(t("errors.selectDeliveryMethod"), " ");
        scrollToSection('[data-section="delivery-methods"]');
        return;
      }

      // Only auto-select card payment method if:
      // 1. No payment method is currently selected, OR
      // 2. The currently selected method is a card payment method
      // This prevents overriding when user switches to non-card payment methods (COD, Tabby, etc.)
      const isCurrentlyCardPayment =
        selectedPayment && requiresCardPaymentSection(selectedPayment);

      if (!selectedPayment || isCurrentlyCardPayment) {
        const firstCardPaymentMethod = availablePaymentMethods.find((method) =>
          requiresCardPaymentSection(method.code)
        );
        if (firstCardPaymentMethod) {
          setSelectedPayment(firstCardPaymentMethod.code);
        }
      }
      setPaymentCardToken(token);
      if (card) {
        // CRITICAL: Don't override a non-default card with a default card
        // This protects restored cards (which are usually non-default) from being overridden
        if (
          card.isDefault &&
          selectedPaymentCard &&
          !selectedPaymentCard.isDefault &&
          selectedPaymentCard.id !== card.id
        ) {
          return; // Don't override non-default card with default card!
        }

        setSelectedPaymentCard(card);
      } else {
        setSelectedPaymentCard(null);
      }

      // For PayFort, store card number and CVV in state (not saved to backend)
      if (cardNumber) {
        setPayfortCardNumber(cardNumber);
      } else {
        setPayfortCardNumber(null);
      }

      // Only update CVV state when a CVV string is explicitly provided.
      // Background refreshes should pass `cvv: undefined` so we don't clobber user input.
      if (typeof cvv === "string") {
        if (cvv.length > 0) {
          setPayfortCvv(cvv);
          // Also set savedCardCvv for compatibility
          setSavedCardCvv(cvv);
          // Store timestamp when CVV is entered
          const cvvTimestamp = Date.now();
          lastCardSelectionRef.current.cvvTimestamp = cvvTimestamp;
          // Also store in sessionStorage for persistence across page reloads
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "checkout-cvv-timestamp",
              cvvTimestamp.toString()
            );
          }
        } else {
          setPayfortCvv(null);
          setSavedCardCvv(null);
          lastCardSelectionRef.current.cvvTimestamp = undefined;
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("checkout-cvv-timestamp");
          }
        }
      }
      // Cache last card selection to restore if the user switches away and back
      lastCardSelectionRef.current = {
        card: card ?? null,
        cvv: typeof cvv === "string" ? cvv : lastCardSelectionRef.current.cvv,
        cvvTimestamp:
          typeof cvv === "string" && cvv.length > 0
            ? lastCardSelectionRef.current.cvvTimestamp
            : lastCardSelectionRef.current.cvvTimestamp,
        token: token || null,
      };

      // Find the first card payment method from available methods
      const cardPaymentMethod = availablePaymentMethods.find((method) =>
        requiresCardPaymentSection(method.code)
      );

      if (!cardPaymentMethod) {
        showError(t("errors.invalidPaymentMethod"), " ");
        return;
      }

      // Don't set payment method if we're not on checkout page (e.g., navigating away)
      if (pathname !== ROUTES.CHECKOUT.ROOT) {
        return;
      }

      // CRITICAL: Double-check order isn't being placed before setting payment method
      // This catches race conditions where order placement starts between the initial check and here
      if (isPlacingOrder) {
        return;
      }

      try {
        const result = await setPaymentMethodOnCartAction({
          paymentMethodCode: cardPaymentMethod.code,
        });
        if (!isOk(result)) {
          // Check if the error indicates cart is consumed/gone - happens after order placement or failed attempts
          const isCartGoneError =
            result.error?.toLowerCase().includes("cart isn't active") ||
            result.error?.toLowerCase().includes("cart is not active") ||
            result.error?.toLowerCase().includes("unexpected response") ||
            result.error?.toLowerCase().includes("cart not found") ||
            result.error?.toLowerCase().includes("no such entity");

          if (isCartGoneError) {
            // Delete the cart ID to force a fresh cart
            try {
              const { deleteCartId } =
                await import("@/lib/actions/cookies/cart");
              await deleteCartId();
            } catch (deleteError) {
              console.error(
                "[CheckoutPage] Failed to delete cart ID:",
                deleteError
              );
            }

            // Invalidate cart cache to force refetch (will create new cart if needed)
            await queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.CART.ROOT(locale),
            });

            // Retry setting payment method after cart refresh
            // Wait a bit for cart to be recreated
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Use selectedPayment directly as it's now a backend code
            const retryResult = await setPaymentMethodOnCartAction({
              paymentMethodCode: selectedPayment,
            });

            if (!isOk(retryResult)) {
              showError(
                retryResult.error ?? t("errors.failedToSetPaymentMethod"),
                " "
              );
              return;
            }

            // Success after retry
            await queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.CART.ROOT(locale),
            });
            return;
          }

          showError(result.error ?? t("errors.failedToSetPaymentMethod"), " ");
          return;
        }

        // Validate BIN after payment method is successfully set
        const binNumber = extractBinNumber(cardNumber, card?.bin);

        // Call validateBin mutation if BIN is available
        if (binNumber) {
          await validateBin({ binNumber });
        } else {
          // Invalidate cart cache
          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.CART.ROOT(locale),
          });
        }
      } catch (error) {
        // Don't show error if we've navigated away from checkout page or component is unmounting
        if (pathname !== ROUTES.CHECKOUT.ROOT || !isMountedRef.current) {
          return;
        }

        // CRITICAL: Don't show error if cart is gone (expected after order placement)
        const isCartGoneError =
          error instanceof Error &&
          (error.message.includes("unexpected response") ||
            error.message.includes("cart isn't active") ||
            error.message.includes("cart is not active") ||
            error.message.includes("cart not found") ||
            error.message.includes("no such entity"));

        if (isCartGoneError) {
          return;
        }

        console.error("Failed to set payment method on cart:", error);
        // Only show error if it's not a navigation-related error
        if (error instanceof Error && !error.message.includes("abort")) {
          showError(t("errors.failedToUpdatePaymentMethod"), " ");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      availablePaymentMethods,
      isPlacingOrder,
      locale,
      pathname,
      queryClient,
      scrollToSection,
      selectedDelivery,
      selectedPayment,
      showError,
      t,
    ]
  );

  // Check if an address is selected (either regular address or locker address)
  const hasSelectedAddress = Boolean(
    selectedAddressId || selectedLockerAddressType
  );

  const hasRequiredSelections = Boolean(
    hasSelectedAddress && selectedDelivery && selectedPayment
  );

  // For Checkout.com card payments, require a card token or saved card + CVV
  // Check if selected payment is a card payment method
  const isCheckoutComPayment = requiresCardPaymentSection(selectedPayment);

  const isSavedCard =
    selectedPaymentCard?.sourceId && selectedPaymentCard.sourceId.length > 0;
  const needsCvvForSavedCard =
    !!isSavedCard && !selectedPaymentCard?.checkoutPaymentId;
  const hasValidCvvForSavedCard =
    !needsCvvForSavedCard || (savedCardCvv?.length ?? 0) >= 3;

  const hasCheckoutComCard =
    !!paymentCardToken || (!!selectedPaymentCard && hasValidCvvForSavedCard);

  // For Apple Pay, check if it's selected and we have the startPayment function ready
  const isApplePayPayment = isApplePayPaymentMethod(selectedPayment);

  // Check if selected payment method is still available
  const isSelectedPaymentMethodAvailable = useMemo(() => {
    if (!selectedPayment || availablePaymentMethods.length === 0) {
      return false;
    }

    // selectedPayment is now a backend code directly
    const isAvailable = availablePaymentMethods.some(
      (method) => method.code.toLowerCase() === selectedPayment.toLowerCase()
    );

    return isAvailable;
  }, [selectedPayment, availablePaymentMethods]);

  const canPlaceOrder =
    hasRequiredSelections &&
    availablePaymentMethods.length > 0 &&
    isSelectedPaymentMethodAvailable &&
    (!isCheckoutComPayment || hasCheckoutComCard) &&
    hasValidCvvForSavedCard;

  const currencyCode = storeConfig?.currencyCode || "SAR";

  const customerAddressForForm = useMemo(() => {
    if (!editingAddress) return undefined;

    return {
      ...editingAddress.customerAddress,
      countryLabel:
        (editingAddress.customerAddress as any).countryLabel ??
        editingAddress.customerAddress.countryCode,
      stateLabel:
        (editingAddress.customerAddress as any).stateLabel ??
        editingAddress.customerAddress.regionName,
    };
  }, [editingAddress]);

  const openAddressList = useCallback(() => {
    // Determine which tab to show based on the selected address's address_label
    let tab: "gifting" | "home" | undefined = undefined;
    if (selectedAddress) {
      const addressLabel =
        (
          (selectedAddress.customerAddress as any)?.address_label ||
          (selectedAddress.customerAddress as any)?.raw?.address_label ||
          ""
        )?.toLowerCase() || "";
      if (addressLabel === "gift") {
        tab = "gifting";
      } else {
        tab = "home";
      }
    }
    setInitialAddressTab(tab);
    setEditingAddress(null);
    setAddressDrawerView("list");
    setIsAddressDrawerOpen(true);
  }, [selectedAddress]);

  const openAddressForm = useCallback((address: CheckoutAddress | null) => {
    setEditingAddress(address);
    setAddressDrawerView("form");
    setIsAddressDrawerOpen(true);
  }, []);

  const getAddressCoordinates = useCallback((address: CheckoutAddress) => {
    const rawAddress = address.customerAddress?.raw as
      | {
          latitude?: string;
          longitude?: string;
        }
      | undefined;
    const customerAddress = address.customerAddress as
      | {
          latitude?: string;
          longitude?: string;
        }
      | undefined;

    const latitude = Number(customerAddress?.latitude ?? rawAddress?.latitude);
    const longitude = Number(
      customerAddress?.longitude ?? rawAddress?.longitude
    );

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  }, []);

  const getAddressTypeForRoute = useCallback((address: CheckoutAddress) => {
    const addressLabel =
      (
        (address.customerAddress as any)?.address_label ||
        (address.customerAddress as any)?.raw?.address_label ||
        ""
      )?.toLowerCase() || "";

    return addressLabel === "gift" ? "gift_delivery" : "home_delivery";
  }, []);

  const openAddressMapEditor = useCallback(
    (address: CheckoutAddress) => {
      const coordinates = getAddressCoordinates(address);

      if (!coordinates) {
        openAddressForm(address);
        return;
      }

      const params = new URLSearchParams({
        firstName: address.customerAddress?.firstName || "",
        lastName: address.customerAddress?.lastName || "",
        latitude: `${coordinates.latitude}`,
        longitude: `${coordinates.longitude}`,
        phoneNumber:
          ((address.customerAddress as any)?.raw?.telephone as string) ||
          address.phoneNumber ||
          "",
        type: getAddressTypeForRoute(address),
      });

      setEditingAddress(null);
      setIsAddressDrawerOpen(false);
      router.push(
        `${ROUTES.CHECKOUT.ADD_DELIVERY_ADDRESS}?${params.toString()}`
      );
    },
    [
      getAddressCoordinates,
      getAddressTypeForRoute,
      openAddressForm,
      router,
      setEditingAddress,
    ]
  );

  const handleEditAddress = useCallback(
    (addressId: string) => {
      trackCheckoutOrderReviewEditAddress();

      // If it's a locker address, navigate to add-pickup-point route with locker type
      if (addressId === "cart-shipping-address" && selectedLockerAddressType) {
        router.push(
          ROUTES.CHECKOUT.ADD_PICKUP_POINT(selectedLockerAddressType)
        );
        return;
      }

      const addressToEdit =
        addresses.find((address) => address.id === addressId) ?? null;

      if (addressToEdit) {
        openAddressMapEditor(addressToEdit);
      }
    },
    [addresses, openAddressMapEditor, router, selectedLockerAddressType]
  );

  const closeAddressDrawer = useCallback(() => {
    setIsAddressDrawerOpen(false);
    setAddressDrawerView("list");
    setEditingAddress(null);
  }, []);

  const closeAddressDrawerWithoutViewChange = useCallback(() => {
    setIsAddressDrawerOpen(false);
    setEditingAddress(null);
  }, []);

  const handleAddressFormClose = useCallback(() => {
    const wasAddingNew = editingAddress === null;
    if (wasAddingNew) {
      closeAddressDrawerWithoutViewChange();
    } else {
      closeAddressDrawer();
    }
  }, [editingAddress, closeAddressDrawer, closeAddressDrawerWithoutViewChange]);

  const handleAddressDrawerRootBack = useCallback(() => {
    if (editingAddress) {
      if (editingAddress.id === selectedAddressId) {
        closeAddressDrawer();
        return;
      }

      if (!selectedShippingOption) {
        setAddressDrawerView("list");
        setEditingAddress(null);
      } else {
        closeAddressDrawer();
      }
      return;
    }

    if (selectedShippingOption) {
      // Track back_to_shipping_type when going back from home/gift address section
      trackBackToShippingType();
      setIsAddressDrawerOpen(false);
      setIsShippingOptionDrawerOpen(true);
    } else {
      closeAddressDrawer();
    }
  }, [
    closeAddressDrawer,
    editingAddress,
    selectedAddressId,
    selectedShippingOption,
    setIsShippingOptionDrawerOpen,
  ]);

  const startAddAddressFlow = useCallback(() => {
    setIsAddressDrawerOpen(false);
    setAddressDrawerView("list");
    setEditingAddress(null);
    setIsShippingOptionDrawerOpen(true);
  }, [setIsShippingOptionDrawerOpen]);

  const handleShippingOptionConfirm = useCallback(
    (option: string) => {
      setSelectedShippingOption(option);
      setIsShippingOptionDrawerOpen(false);
      openAddressForm(null);
    },
    [openAddressForm, setIsShippingOptionDrawerOpen]
  );

  const getAddressLabelFromShippingOption = useCallback(
    (option: null | string): string | undefined => {
      if (!option) return undefined;
      if (option === "home_delivery") return "Home";
      if (option === "gift_delivery") return "Gift";
      return undefined;
    },
    []
  );

  const updateProfileFromHomeAddress = useCallback(
    async (address: CheckoutAddress | null, shippingOption?: null | string) => {
      const currentShippingOption = shippingOption ?? selectedShippingOption;
      if (currentShippingOption !== "home_delivery" || !address) {
        return;
      }
      const needsFirstName = !customerInfo?.firstName;
      const needsLastName = !customerInfo?.lastName;
      const needsEmail = !customerInfo?.email;

      if (!needsFirstName && !needsLastName && !needsEmail) {
        return;
      }
      const addressFirstName = (address.customerAddress as CustomerAddressModel)
        ?.firstName;
      const addressLastName = (address.customerAddress as CustomerAddressModel)
        ?.lastName;
      // Check for email in address raw data or custom attributes
      const addressEmail =
        (address.customerAddress as any)?.email ||
        (address.customerAddress as any)?.raw?.email ||
        undefined;

      const profilePayload: {
        email?: string;
        firstName?: string;
        lastName?: string;
      } = {};

      if (needsFirstName && addressFirstName && addressFirstName.trim()) {
        profilePayload.firstName = addressFirstName.trim();
      }

      if (needsLastName && addressLastName && addressLastName.trim()) {
        profilePayload.lastName = addressLastName.trim();
      }

      if (needsEmail && addressEmail && addressEmail.trim()) {
        profilePayload.email = addressEmail.trim();
      }

      if (Object.keys(profilePayload).length > 0) {
        try {
          const result = await updateProfileFromAddress(profilePayload);
          if (!isOk(result)) {
            console.error(
              "[CheckoutPage] Failed to update profile from home address:",
              result.error
            );
          }
        } catch (error) {
          console.error(
            "[CheckoutPage] Error updating profile from home address:",
            error
          );
        }
      }
    },
    [customerInfo, selectedShippingOption]
  );

  const refreshAddresses = useCallback(
    async (
      isNewAddressAdded = false,
      editedAddressId?: null | string
    ): Promise<CheckoutAddress | null> => {
      try {
        const response = await fetch("/api/customer/addresses", {
          cache: "no-store",
        });

        if (response.status === 401) {
          setAddresses([]);
          setSelectedAddressId(null);
          showError(t("errors.signInToManageAddresses"), " ");
          return null;
        }

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }

        const json = (await response.json()) as {
          data: { addresses: CustomerAddressModel[] } | null;
          error: null | string;
        };

        if (json.error) {
          throw new Error(json.error);
        }

        const nextAddresses =
          json.data?.addresses?.map((address) => ({
            customerAddress: {
              ...address,
              address_label: (address as any).address_label || null,
              countryLabel:
                (address as any).countryLabel ?? address.countryCode,
              stateLabel: (address as any).stateLabel ?? address.regionName,
            },
            formattedAddress: address.formattedAddress,
            id: address.id,
            isDefault: address.isDefault,
            name: address.name,
            phoneNumber: address.mobileNumber,
          })) ?? [];

        const nextAddressIds = new Set(nextAddresses.map((addr) => addr.id));
        const hadAddressesBefore = previousAddressIdsRef.current.size > 0;
        const wasAddingNewAddress =
          isNewAddressAdded ||
          (hadAddressesBefore &&
            nextAddressIds.size > previousAddressIdsRef.current.size) ||
          (!hadAddressesBefore && nextAddresses.length > 0);

        // Find the newly added address - prioritize by checking if isNewAddressAdded is true
        // or by finding the address that wasn't in the previous set
        const newAddressId = wasAddingNewAddress
          ? (nextAddresses.find(
              (addr) => !previousAddressIdsRef.current.has(addr.id)
            )?.id ??
            (isNewAddressAdded
              ? nextAddresses[nextAddresses.length - 1]?.id
              : null))
          : null;

        previousAddressIdsRef.current = nextAddressIds;

        setAddresses(nextAddresses);
        setEditingAddress(null);
        // Only set view to "list" if not adding a new address (new address should close drawer)
        if (!wasAddingNewAddress) {
          setAddressDrawerView("list");
        }

        // Always select newly added address when adding a new address
        let finalSelectedAddressId: null | string = null;
        let newAddress: CheckoutAddress | null = null;

        if (wasAddingNewAddress && newAddressId) {
          newAddress =
            nextAddresses.find((addr) => addr.id === newAddressId) ?? null;

          // Clear delivery and payment selections when adding new address
          setSelectedDelivery("");
          setSelectedPayment("");
          // Clear locker address if one was selected (new address takes priority)
          if (selectedLockerAddressType) {
            setSelectedLockerAddressType(null);
            clearLockerInfo();
          }
          setSelectedAddressId(newAddressId);
          finalSelectedAddressId = newAddressId;
        } else {
          // If editing an address, select the edited address
          if (
            editedAddressId &&
            nextAddresses.some((address) => address.id === editedAddressId)
          ) {
            // Clear delivery and payment selections when editing address
            // (address details may have changed, affecting available methods)
            setSelectedDelivery("");
            setSelectedPayment("");
            // Clear locker address if one was selected and we're selecting a regular address
            if (
              selectedLockerAddressType &&
              editedAddressId !== "cart-shipping-address"
            ) {
              setSelectedLockerAddressType(null);
              clearLockerInfo();
            }
            setSelectedAddressId(editedAddressId);
            finalSelectedAddressId = editedAddressId;
          } else {
            // If not adding a new address, maintain current selection or select default
            setSelectedAddressId((prev) => {
              // If the previously selected address still exists, keep it selected
              if (
                prev &&
                nextAddresses.some((address) => address.id === prev)
              ) {
                // Clear locker address if one was selected and we're keeping a regular address
                if (
                  selectedLockerAddressType &&
                  prev !== "cart-shipping-address"
                ) {
                  setSelectedLockerAddressType(null);
                  clearLockerInfo();
                }
                finalSelectedAddressId = prev;
                return prev;
              }

              // Only auto-select if there's a default address available
              const defaultAddress = nextAddresses.find(
                (address) => address.isDefault
              );

              finalSelectedAddressId = defaultAddress
                ? defaultAddress.id
                : null;

              // Clear locker address if one was selected and we're selecting a default address
              if (
                selectedLockerAddressType &&
                finalSelectedAddressId &&
                finalSelectedAddressId !== "cart-shipping-address"
              ) {
                setSelectedLockerAddressType(null);
                clearLockerInfo();
              }

              return finalSelectedAddressId;
            });
          }
        }

        // Update profile if home address is selected
        if (
          finalSelectedAddressId &&
          selectedShippingOption === "home_delivery"
        ) {
          const selectedAddr = nextAddresses.find(
            (addr) => addr.id === finalSelectedAddressId
          );
          if (selectedAddr) {
            await updateProfileFromHomeAddress(selectedAddr);
          }
        }

        return newAddress;
      } catch (error) {
        console.error("Failed to refresh addresses", error);
        showError(t("errors.failedToRefreshAddresses"), " ");
        return null;
      }
    },
    [
      selectedLockerAddressType,
      selectedShippingOption,
      setSelectedLockerAddressType,
      setSelectedPayment,
      showError,
      t,
      updateProfileFromHomeAddress,
    ]
  );

  useEffect(() => {
    const consumeSavedAddressRefresh = () => {
      const shouldRefresh =
        window.sessionStorage.getItem(CHECKOUT_ADDRESS_SAVED_FLAG) === "true";

      if (!shouldRefresh) {
        return;
      }

      window.sessionStorage.removeItem(CHECKOUT_ADDRESS_SAVED_FLAG);
      setIsRefreshingAddresses(true);

      void refreshAddresses(true).finally(() => {
        setIsRefreshingAddresses(false);
      });
    };

    const handleAddressSaved = () => {
      consumeSavedAddressRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        consumeSavedAddressRefresh();
      }
    };

    consumeSavedAddressRefresh();
    window.addEventListener(CHECKOUT_ADDRESS_SAVED_EVENT, handleAddressSaved);
    window.addEventListener("focus", consumeSavedAddressRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(
        CHECKOUT_ADDRESS_SAVED_EVENT,
        handleAddressSaved
      );
      window.removeEventListener("focus", consumeSavedAddressRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshAddresses]);

  const handleAddAddressClick = useCallback(() => {
    if (addresses.length === 0) {
      startAddAddressFlow();
      return;
    }

    openAddressList();
  }, [addresses.length, openAddressList, startAddAddressFlow]);

  const handleDeleteAddress = useCallback(
    async (address: CheckoutAddress) => {
      try {
        const response = await fetch(
          `/api/customer/addresses?id=${address.id}`,
          {
            method: "DELETE",
          }
        );

        const json = (await response.json()) as {
          data: null | string;
          error: null | string;
        };

        if (!response.ok || json.error) {
          throw new Error(json.error || "Failed to delete address");
        }

        trackAddressbookDeleteAddress();
        showSuccess(json.data || t("messages.addressDeleted"), " ");
        await refreshAddresses();
      } catch (error) {
        console.error("Failed to delete address", error);
        showError(
          error instanceof Error ? error.message : "Failed to delete address",
          " "
        );
      }
    },
    [refreshAddresses, showError, showSuccess, t]
  );

  const trackSubmitError = useTrackCheckoutSubmitError(
    shippingMethods,
    selectedDelivery,
    selectedPayment || ""
  );

  const trackPurchaseAttemptEvent = useTrackPurchaseAttempt(
    shippingMethods,
    selectedDelivery,
    selectedPayment || ""
  );

  const handlePrimaryButtonClick = useCallback(async () => {
    // If address is selected but delivery method is not, scroll to delivery section
    if (selectedAddressId && !selectedDelivery) {
      trackSubmitError();
      scrollToSection('[data-section="delivery-methods"]');
      highlightSection('[data-section="delivery-methods-list"]', 300);
      return;
    }

    // Skip all validations and scrolling if order is already being placed
    // This prevents the flash of validation screens during redirect
    if (
      isPlacingOrder ||
      isSettingShippingAddress ||
      isSettingBillingAddress ||
      isSettingShippingMethod ||
      isRefreshingPaymentMethods ||
      isLoadingShippingMethods
    ) {
      return;
    }

    if (
      !canPlaceOrder &&
      selectedDelivery &&
      hasSelectedAddress &&
      availablePaymentMethods.length > 0
    ) {
      // Check if it's a card payment method that needs a card
      if (requiresCardPaymentSection(selectedPayment) && !hasCheckoutComCard) {
        trackSubmitError();
        // Scroll to card payment section to add card
        const cardPaymentSection = document.querySelector(
          '[data-section="card-payment"]'
        );
        if (cardPaymentSection) {
          scrollToSection('[data-section="card-payment"]');
          highlightSection('[data-section="card-payment"]', 300);
        } else {
          scrollToSection('[data-section="payment-methods"]');
          highlightSection('[data-section="payment-methods-section"]', 300);
        }
        return;
      }
      trackSubmitError();
      // Scroll to payment section
      const paymentSection = document.querySelector(
        '[data-section="payment-methods"]'
      );
      if (paymentSection) {
        scrollToSection('[data-section="payment-methods"]');
        highlightSection('[data-section="payment-methods-section"]', 300);
        // Focus on the first payment option for accessibility
        const firstPaymentOption = paymentSection.querySelector(
          'input[type="radio"]'
        ) as HTMLInputElement;
        if (firstPaymentOption) {
          setTimeout(() => firstPaymentOption.focus(), 300);
        }
      }
      return;
    }

    if (!canPlaceOrder) {
      // Track checkout_submit_error when place order button clicked but form is invalid
      trackSubmitError();
      // If no address is selected at all, show an explicit error message
      if (!hasSelectedAddress) {
        showError(t("errors.selectShippingAddress"), " ");
      }
      handleAddAddressClick();
      return;
    }

    // Explicit CVV validation for saved cards only when needed
    const isSavedCardForValidation =
      selectedPaymentCard?.sourceId && selectedPaymentCard.sourceId.length > 0;
    const needsCvvForSavedCardForValidation =
      !!isSavedCardForValidation && !selectedPaymentCard?.checkoutPaymentId;

    if (needsCvvForSavedCardForValidation && (savedCardCvv?.length ?? 0) < 3) {
      trackSubmitError();
      showError("Please enter CVV", " ");
      // Scroll to card payment section if it exists (where CVV input is), otherwise scroll to payment methods
      const cardPaymentSection = document.querySelector(
        '[data-section="card-payment"]'
      );
      if (cardPaymentSection) {
        scrollToSection('[data-section="card-payment"]');
        // Highlight all card rows instead of just the container
        const cardRows = cardPaymentSection.querySelectorAll("[data-card-row]");
        cardRows.forEach((row) => {
          if (row instanceof HTMLElement) {
            const previousBackgroundColor = row.style.backgroundColor || "";
            // Use !important to override Tailwind bg-white class
            row.style.setProperty(
              "background-color",
              "rgba(37, 104, 242, 0.08)",
              "important"
            );
            // Remove highlight after 500ms
            setTimeout(() => {
              if (previousBackgroundColor) {
                row.style.setProperty(
                  "background-color",
                  previousBackgroundColor,
                  "important"
                );
              } else {
                row.style.removeProperty("background-color");
              }
            }, 500);
          }
        });
        // Focus on CVV input after scrolling
        setTimeout(() => {
          const cvvInput = cardPaymentSection.querySelector(
            'input[data-input="cvv"]'
          ) as HTMLInputElement;
          if (cvvInput) {
            cvvInput.focus();
          }
        }, 400);
      } else {
        scrollToSection('[data-section="payment-methods"]');
        highlightSection('[data-section="payment-methods-section"]', 300);
      }
      return;
    }

    // Explicit validation before placing order
    if (!hasSelectedAddress) {
      trackSubmitError();
      showError(t("errors.selectShippingAddress"), " ");
      handleAddAddressClick();
      return;
    }

    if (!selectedDelivery) {
      trackSubmitError();
      // Don't show toast if delivery methods are still loading or just finished loading
      if (
        !isLoadingShippingMethods &&
        !deliveryMethodsJustLoadedRef.current &&
        hasReceivedShippingMethods
      ) {
        showError(t("errors.selectDeliveryMethod"), " ");
      }
      scrollToSection('[data-section="delivery-methods"]');
      highlightSection('[data-section="delivery-methods-list"]', 300);
      return;
    }

    if (!selectedPayment) {
      trackSubmitError();
      showError(t("errors.selectPaymentMethod"), " ");
      scrollToSection('[data-section="payment-methods"]');
      highlightSection('[data-section="payment-methods-section"]', 300);
      return;
    }

    // Validate that card payment has required data
    if (requiresCardPaymentSection(selectedPayment)) {
      const backendCode = selectedPayment; // Already a backend code
      const isPayfort = backendCode.toLowerCase().includes("payfort");

      if (isPayfort) {
        // For PayFort, we need card number and CVV (not saved, just in state)
        if (!payfortCardNumber || !payfortCvv) {
          trackSubmitError();
          const errorMessage =
            t("errors.selectCardForPayment") ||
            "Please add a payment card with card number and CVV";
          showError(errorMessage, " ");
          const paymentSection = document.querySelector(
            '[data-section="payment-methods"]'
          );
          if (paymentSection) {
            paymentSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            highlightSection('[data-section="payment-methods-section"]', 300);
          }
          return;
        }
      } else {
        // For Checkout.com, validate token OR saved card (+ CVV only when needed).
        const hasNewCardToken = !!paymentCardToken;
        const isSavedCard =
          selectedPaymentCard?.sourceId &&
          selectedPaymentCard.sourceId.length > 0;
        const needsCvvForSavedCard =
          !!isSavedCard && !selectedPaymentCard?.checkoutPaymentId;
        const hasValidCvv = (savedCardCvv?.length ?? 0) >= 3;
        const hasSavedCard =
          !!selectedPaymentCard && (!needsCvvForSavedCard || hasValidCvv);

        if (!hasNewCardToken && !hasSavedCard) {
          trackSubmitError();
          const errorMessage =
            needsCvvForSavedCard && !hasValidCvv
              ? "Please enter CVV"
              : t("errors.selectCardForPayment") ||
                "Please add or select a payment card";
          showError(errorMessage, " ");
          // Scroll to card payment section if it exists, otherwise scroll to payment methods
          const cardPaymentSection = document.querySelector(
            '[data-section="card-payment"]'
          );
          if (cardPaymentSection) {
            scrollToSection('[data-section="card-payment"]');
            // If CVV is needed, highlight all card rows; otherwise highlight the section
            if (needsCvvForSavedCard && !hasValidCvv) {
              const cardRows =
                cardPaymentSection.querySelectorAll("[data-card-row]");
              cardRows.forEach((row) => {
                if (row instanceof HTMLElement) {
                  const previousBackgroundColor =
                    row.style.backgroundColor || "";
                  // Use !important to override Tailwind bg-white class
                  row.style.setProperty(
                    "background-color",
                    "rgba(37, 104, 242, 0.08)",
                    "important"
                  );
                  // Remove highlight after 500ms
                  setTimeout(() => {
                    if (previousBackgroundColor) {
                      row.style.setProperty(
                        "background-color",
                        previousBackgroundColor,
                        "important"
                      );
                    } else {
                      row.style.removeProperty("background-color");
                    }
                  }, 500);
                }
              });
              // Focus on CVV input after scrolling
              setTimeout(() => {
                const cvvInput = cardPaymentSection.querySelector(
                  'input[data-input="cvv"]'
                ) as HTMLInputElement;
                if (cvvInput) {
                  cvvInput.focus();
                }
              }, 400);
            } else {
              highlightSection('[data-section="card-payment"]', 300);
            }
          } else {
            scrollToSection('[data-section="payment-methods"]');
            highlightSection('[data-section="payment-methods-section"]', 300);
          }
          return;
        }
      }
    }

    if (availablePaymentMethods.length === 0) {
      trackSubmitError();
      showError(t("errors.paymentMethodsUnavailable"), " ");
      return;
    }

    if (shippingMethods.length === 0 && hasSelectedAddress) {
      trackSubmitError();
      showError(t("errors.failedToUpdateShippingMethod"), " ");
      return;
    }

    startPlaceOrderTransition(async () => {
      try {
        const selectedAddress = addresses.find(
          (addr) => addr.id === selectedAddressId
        );
        const addressLabel =
          (selectedAddress?.customerAddress as any)?.raw?.address_label ||
          (selectedAddress?.customerAddress as any)?.address_label ||
          "";
        const isGiftAddress = addressLabel?.toLowerCase() === "gift";
        const hasDefaultBilling = addresses.some((addr) => addr.isDefault);
        const isFirstAddress = addresses.length === 1;

        if (
          isGiftAddress &&
          !hasDefaultBilling &&
          isFirstAddress &&
          selectedAddress &&
          selectedShippingOption === "gift_delivery"
        ) {
          const rawData = (selectedAddress.customerAddress as any)?.raw || {};
          const customAttributes =
            rawData.custom_attributesV2 || rawData.custom_attributes || [];

          const senderFirstNameAttr = customAttributes.find(
            (attr: any) =>
              attr?.attribute_code === "sender_first_name" ||
              attr?.code === "sender_first_name"
          );
          const senderLastNameAttr = customAttributes.find(
            (attr: any) =>
              attr?.attribute_code === "sender_last_name" ||
              attr?.code === "sender_last_name"
          );
          const senderPhoneAttr = customAttributes.find(
            (attr: any) =>
              attr?.attribute_code === "sender_phone" ||
              attr?.code === "sender_phone"
          );

          const customerAddr =
            selectedAddress.customerAddress as CustomerAddressModel;
          const senderFirstName =
            senderFirstNameAttr?.value ||
            rawData.sender_first_name ||
            customerAddr?.firstName ||
            "";
          const senderLastName =
            senderLastNameAttr?.value ||
            rawData.sender_last_name ||
            customerAddr?.lastName ||
            "";
          const senderPhone =
            senderPhoneAttr?.value ||
            rawData.sender_phone ||
            customerAddr?.mobileNumber ||
            "";

          // For gift address, use current user's phone, first name, and last name
          // Otherwise, use the sender info from the address
          const billingFirstName =
            currentCustomer?.firstName ||
            senderFirstName ||
            customerAddr?.firstName ||
            "";
          const billingLastName =
            currentCustomer?.lastName ||
            senderLastName ||
            customerAddr?.lastName ||
            "";
          const billingPhone =
            currentCustomer?.phoneNumber ||
            senderPhone ||
            customerAddr?.mobileNumber ||
            "";

          // Create billing address by copying shipping address and replacing receiver info with sender info
          const billingAddress: CartAddressInput = {
            address_label: "home", // Billing address should be labeled as "home"
            city: customerAddr?.city || "",
            country_code: customerAddr?.countryCode || "",
            firstname: billingFirstName,
            lastname: billingLastName,
            postcode: customerAddr?.postcode || "",
            region: customerAddr?.regionName || undefined,
            region_id: customerAddr?.regionId || undefined,
            street: customerAddr?.street || [],
            telephone: billingPhone,
          };

          // Set temporary billing address (not saved to address book)
          setIsSettingBillingAddress(true);
          const billingResult = await setBillingAddressOnCartAction({
            address: billingAddress,
          });

          if (!isOk(billingResult)) {
            console.error(
              "[CheckoutPage] Failed to set billing address for gift order:",
              billingResult.error
            );
            showError(
              billingResult.error ?? "Failed to set billing address",
              " "
            );
            setIsSettingBillingAddress(false);
            trackSubmitError();
            return;
          }

          setIsSettingBillingAddress(false);
        }

        // Get customer email for PayFort
        const customerEmail =
          customerInfo?.email || currentCustomer?.email || undefined;

        const paymentToken = paymentCardToken || undefined;

        // Determine shipping type: "Click Collect" for locker methods, "Home Delivery" for others
        const selectedMethod = shippingMethods.find(
          (method) => method.id === selectedDelivery
        );

        // Track purchase_attempt when place order button is clicked with valid form fields
        trackPurchaseAttemptEvent();

        // Store payment method, shipping method, and selected card in sessionStorage before redirect
        // This allows us to track payment errors with correct payment method info
        // after redirect back from payment gateway and restore card selection on cart refill
        const paymentMethodInfo = {
          paymentMethod: selectedPayment || "",
          selectedCardId: selectedPaymentCard?.id || null,
          shippingMethod: selectedMethod?.method_code || "",
        };

        setSessionStorage(
          SessionStorageKey.PAYMENT_METHOD_INFO,
          JSON.stringify(paymentMethodInfo)
        );
        // Skip launch event when returning from payment-success/refill-cart (COD, fail, or external)
        setSessionStorage(
          SessionStorageKey.SKIP_LAUNCH_ON_CHECKOUT_RETURN,
          "1"
        );

        if (isApplePayPayment) {
          placeOrderWithApplePay();
          return;
        }

        const bulletDeliveryUnavailableError = t(
          "errors.bulletDeliveryMethodUnavailable",
          {
            carrierTitle: selectedMethod?.carrier_title || "",
          }
        );

        const result = await placeOrderAction({
          baseUrl: location.origin,
          bulletDeliveryUnavailableError,
          customerEmail: customerEmail || undefined,
          payfortCardNumber: payfortCardNumber || undefined,
          payfortCvv: payfortCvv || undefined,
          paymentToken: paymentToken || undefined,
          savedCardCvv: savedCardCvv || undefined,
          selectedPaymentCard: selectedPaymentCard || undefined,
        });

        if (result.error === bulletDeliveryUnavailableError) {
          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.CART.ROOT(locale),
          });
        }

        // Handle errors
        if (result && typeof result === "object" && "error" in result) {
          const errorResult = result as PlaceOrderFailureResult;
          const errorMessage = errorResult.error ?? "Unknown error";

          // Check if this is a redirect error (shouldn't happen now, but handle it just in case)
          if (errorMessage === "NEXT_REDIRECT") {
            // Redirect is happening, just return silently
            return;
          }

          // Track purchase_error when place order fails
          if (cart) {
            const cartProperties = buildCartProperties(cart, { storeConfig });
            trackPurchaseError(
              cartProperties,
              selectedPayment || "",
              selectedMethod?.method_code || ""
            );
          }

          console.error("[CheckoutPage] Failed to place order:", errorMessage);

          // Check if this is a network error
          const errorObj = new Error(errorMessage);
          let finalErrorMessage =
            errorMessage ?? t("errors.failedToPlaceOrder");

          if (isTimeoutError(errorObj)) {
            finalErrorMessage = t("errors.timeoutError");
          } else if (isNetworkError(errorObj)) {
            finalErrorMessage = t("errors.networkError");
          }

          const lockerMethodUnavailableMessage = t(
            "errors.lockerMethodUnavailable"
          );

          // If the error is about locker method being unavailable, clear locker selections
          if (finalErrorMessage === lockerMethodUnavailableMessage) {
            // Clear locker address and shipping method
            if (selectedLockerAddressType) {
              setSelectedLockerAddressType(null);
              clearLockerInfo();
            }
            setSelectedDelivery("");

            // Invalidate cart to refresh shipping methods and addresses
            await queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.CART.ROOT(locale),
            });
          }

          toast({
            title: finalErrorMessage,
            type: "error",
          });

          if (
            errorResult.errorCode === CheckoutError.InvalidCart &&
            errorResult.redirectTo
          ) {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.CART.ROOT(locale),
            });
            router.replace(errorResult.redirectTo);
            return;
          }

          await sleep(DEFAULT_TOAST_DURATION);
          return;
        }

        // Reset delivery and payment selections after successful order
        setSelectedDelivery("");
        setSelectedPayment("");
        setSelectedPaymentCard(null);
        setPaymentCardToken(null);
        setSavedCardCvv(null);
        // Mark cart ID to prevent auto-selection from new cart after order
        previousCartIdRef.current = cartId || null;
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "digest" in error &&
          typeof error.digest === "string" &&
          error.digest.includes("NEXT_REDIRECT")
        ) {
          return;
        }

        console.error("Failed to place order:", error);

        // Detect network errors and show appropriate message
        let errorMessage = t("errors.failedToPlaceOrder");

        if (isTimeoutError(error)) {
          errorMessage = t("errors.timeoutError");
        } else if (isNetworkError(error)) {
          errorMessage = t("errors.networkError");
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast({
          title: errorMessage,
          type: "error",
        });
        await sleep(DEFAULT_TOAST_DURATION);
      }
    });
  }, [
    selectedAddressId,
    selectedDelivery,
    isPlacingOrder,
    isSettingShippingAddress,
    isSettingBillingAddress,
    isSettingShippingMethod,
    isRefreshingPaymentMethods,
    isLoadingShippingMethods,
    canPlaceOrder,
    hasSelectedAddress,
    availablePaymentMethods.length,
    selectedPaymentCard,
    savedCardCvv,
    selectedPayment,
    shippingMethods,
    trackSubmitError,
    scrollToSection,
    highlightSection,
    hasCheckoutComCard,
    handleAddAddressClick,
    showError,
    t,
    hasReceivedShippingMethods,
    payfortCardNumber,
    payfortCvv,
    paymentCardToken,
    addresses,
    selectedShippingOption,
    customerInfo?.email,
    currentCustomer?.email,
    currentCustomer?.firstName,
    currentCustomer?.lastName,
    currentCustomer?.phoneNumber,
    trackPurchaseAttemptEvent,
    isApplePayPayment,
    setSelectedPayment,
    cartId,
    placeOrderWithApplePay,
    queryClient,
    locale,
    cart,
    storeConfig,
    selectedLockerAddressType,
    setSelectedLockerAddressType,
    router,
  ]);

  // Check if selected payment method uses cards
  const isCardPaymentMethod = requiresCardPaymentSection(selectedPayment);

  const footerButtonText = (() => {
    if (isPlacingOrder) {
      return t("button.placingOrder");
    }

    if (canPlaceOrder && isCardPaymentMethod) {
      // Use formatPrice and LocalizedPrice component for currency display
      const formattedPrice = formatPrice({
        amount: totalDue,
        currencyCode,
        locale,
        options: {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          useGrouping: true,
        },
      });

      return (
        <>
          {t("button.pay")} <LocalizedPrice price={formattedPrice} />
        </>
      );
    }

    if (canPlaceOrder) {
      // Special text for Apple Pay
      if (isApplePayPayment) {
        const formattedPrice = formatPrice({
          amount: totalDue,
          currencyCode,
          locale,
          options: {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
            useGrouping: true,
          },
        });
        return (
          <>
            {t("button.pay")} <LocalizedPrice price={formattedPrice} />
          </>
        );
      }
      if (selectedPayment === "tabby_installments") {
        return t("button.proceedToTabby");
      }
      if (selectedPayment === "pay_by_instalments") {
        return t("button.proceedToTamara");
      }
      return t("button.placeOrder");
    }

    // Check if saved card is selected but CVV is missing (only when needed)
    const isSavedCardForButton =
      selectedPaymentCard?.sourceId && selectedPaymentCard.sourceId.length > 0;
    const needsCvvForSavedCardForButton =
      !!isSavedCardForButton && !selectedPaymentCard?.checkoutPaymentId;
    if (
      requiresCardPaymentSection(selectedPayment) &&
      needsCvvForSavedCardForButton &&
      (savedCardCvv?.length ?? 0) < 3
    ) {
      return t("button.enterCvv");
    }

    // Check if payment method is selected but no card is added (for checkoutcom/payfort)
    if (
      requiresCardPaymentSection(selectedPayment) &&
      selectedDelivery &&
      hasSelectedAddress &&
      availablePaymentMethods.length > 0 &&
      !hasCheckoutComCard
    ) {
      return t("button.pleaseAddCard");
    }

    if (
      selectedDelivery &&
      hasSelectedAddress &&
      availablePaymentMethods.length > 0
    ) {
      return t("button.selectPaymentMethod");
    }

    if (hasSelectedAddress && !selectedDelivery) {
      return t("button.selectDeliveryMethod" as any);
    }

    return t("button.addChangeAddress");
  })();

  const isAnyApiCallInProgress =
    isPlacingOrder ||
    isSettingShippingAddress ||
    isSettingBillingAddress ||
    isSettingShippingMethod ||
    isRefreshingPaymentMethods ||
    isLoadingShippingMethods ||
    (isApplePayPayment && isApplePayAvailabilityPending);

  const footerDisabled = (() => {
    if (canPlaceOrder) {
      return isPlacingOrder || isAnyApiCallInProgress;
    }

    if (isAnyApiCallInProgress) {
      return true;
    }

    const hasAllRequiredFields =
      hasSelectedAddress && selectedDelivery && selectedPayment;
    if (hasAllRequiredFields && availablePaymentMethods.length === 0) {
      return true;
    }

    if (hasSelectedAddress) {
      return false;
    }

    return !addressToDisplay;
  })();

  return (
    <>
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg">
            <Spinner size={40} variant="dark" />
            <p className="text-text-primary text-lg font-medium">
              {t("button.placingOrder")}
            </p>
          </div>
        </div>
      )}
      <CheckoutHeader
        email={customerInfo?.email ?? currentCustomer?.email ?? undefined}
      />
      <CheckoutOrderReviewTracker
        canPlaceOrder={canPlaceOrder}
        selectedPayment={selectedPayment}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 pb-32 pt-0 md:pt-5 lg:pb-44">
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="flex flex-col gap-3.5 lg:w-[800px] lg:gap-4">
            <CheckoutEditBagLink />
            <div className="h-[1px] w-full bg-[#EEF0F2]" />
            <CheckoutShippingAddressSection
              isLoading={isRefreshingAddresses || isWaitingForLockerAddress}
              onAddAddress={handleAddAddressClick}
              onEditAddress={
                addressToDisplay
                  ? () => handleEditAddress(addressToDisplay.id)
                  : undefined
              }
              selectedAddress={addressToDisplay}
            />
            <div className="h-[1px] w-full bg-[#EEF0F2]" />
            <CheckoutDeliverySection
              deliveryMethods={
                hasSelectedAddress &&
                !isLoadingShippingMethods &&
                !isSettingShippingAddress
                  ? shippingMethods
                  : undefined
              }
              giftWrappingEnabled={giftWrapping}
              hasReceivedResponse={hasReceivedShippingMethods}
              isLoadingDeliveryMethods={
                hasSelectedAddress
                  ? isLoadingShippingMethods || isSettingShippingAddress
                  : false
              }
              isWaitingForMoreInfo={!hasSelectedAddress}
              onGiftWrappingToggle={setGiftWrapping}
              onMethodChange={(methodId) => {
                trackCheckoutDeliveryShippingTypeSelection();
                setSelectedDelivery(methodId);
              }}
              selectedMethod={selectedDelivery}
            />
            <div className="h-[1px] w-full bg-[#EEF0F2]" />
            <CheckoutPaymentMethods
              availablePaymentMethods={availablePaymentMethods}
              cardIdToRestore={cardIdToRestore}
              currencyCode={currencyCode}
              disableAutoSelect={shouldDisableAutoSelect}
              grandTotal={totals.grandTotal}
              initialPaymentCards={useMemo(() => {
                // Merge initialPaymentCards and prefetchedPaymentCards, avoiding duplicates by ID
                const cardMap = new Map<string, PaymentCardData>();
                [...initialPaymentCards, ...prefetchedPaymentCards].forEach(
                  (card) => {
                    if (!cardMap.has(card.id)) {
                      cardMap.set(card.id, card);
                    }
                  }
                );
                return Array.from(cardMap.values());
              }, [initialPaymentCards, prefetchedPaymentCards])}
              isDeliverySelected={!!selectedDelivery}
              onCardTokenReady={handleCardTokenReady}
              onMethodChange={handlePaymentMethodChange}
              selectedMethod={selectedPayment}
              selectedPaymentCard={selectedPaymentCard}
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2.5">
            <OrderActions currencyCode={currencyCode} />

            <CheckoutOrderSummary
              currencyCode={currencyCode}
              deductions={deductions}
              totalDue={totalDue}
              totals={totals}
            />
          </div>
        </div>
      </div>

      <CheckoutStickyFooter
        buttonText={footerButtonText}
        disabled={footerDisabled}
        isLoading={isAnyApiCallInProgress}
        onClick={handlePrimaryButtonClick}
        variant={
          canPlaceOrder && isApplePayPayment
            ? "applePay"
            : canPlaceOrder && isCardPaymentMethod
              ? "primary"
              : "default"
        }
      />

      {isAddressDrawerOpen && addressDrawerView === "list" && (
        <CheckoutAddressDrawer
          addresses={addresses}
          initialTab={initialAddressTab}
          onAddNew={startAddAddressFlow}
          onClose={closeAddressDrawer}
          onDelete={handleDeleteAddress}
          onEdit={openAddressMapEditor}
          onSelect={async (addressId) => {
            // Only clear selections if address actually changed
            if (addressId !== selectedAddressId) {
              setSelectedDelivery("");
              setSelectedPayment("");
            }

            // Reset locker address flag and clear locker info when a different address is selected
            if (
              selectedLockerAddressType &&
              addressId !== "cart-shipping-address"
            ) {
              setSelectedLockerAddressType(null);
              clearLockerInfo();
              // Reset refs to ensure normal address logic runs after switching from locker
              previousSelectedAddressIdRef.current = null;
              isSettingShippingAddressRef.current = false;
            }

            setSelectedAddressId(addressId);

            const selectedAddr = addresses.find(
              (addr) => addr.id === addressId
            );
            if (selectedAddr) {
              const addressLabel =
                (
                  (selectedAddr.customerAddress as any)?.address_label ||
                  (selectedAddr.customerAddress as any)?.raw?.address_label ||
                  ""
                )?.toLowerCase() || "";

              let shippingOption: string;
              if (addressLabel === "gift") {
                shippingOption = "gift_delivery";
                setSelectedShippingOption(shippingOption);
              } else {
                shippingOption = "home_delivery";
                setSelectedShippingOption(shippingOption);
                // Update profile when home address is selected
                await updateProfileFromHomeAddress(
                  selectedAddr,
                  shippingOption
                );
              }
            }

            closeAddressDrawer();
          }}
          selectedAddressId={selectedAddressId}
        />
      )}

      {isAddressDrawerOpen && addressDrawerView === "form" && (
        <AddressFormContextProvider
          customerAddress={customerAddressForForm}
          customerData={
            customerInfo
              ? {
                  email: customerInfo.email,
                  firstName: customerInfo.firstName,
                  lastName: customerInfo.lastName,
                  phoneNumber: customerInfo.phoneNumber,
                }
              : undefined
          }
          initialAddressLabel={getAddressLabelFromShippingOption(
            selectedShippingOption
          )}
          initialSkipState={!customerAddressForForm?.stateLabel}
          isFirstAddressInCheckout={!editingAddress && addresses.length === 0}
          onClose={handleAddressFormClose}
          onRootBack={handleAddressDrawerRootBack}
          onSuccess={() => {
            const wasAddingNew = editingAddress === null;
            const editedAddressId = editingAddress?.id;
            if (!wasAddingNew && editingAddress?.id === selectedAddressId) {
              setSelectedDelivery("");
              setSelectedPayment("");
            }

            // Immediately clear locker address when adding/editing address
            if (selectedLockerAddressType) {
              setSelectedLockerAddressType(null);
              clearLockerInfo();
            }

            // When editing an address (same ID, but data changed), reset the previous address ID ref
            // BEFORE refreshing addresses to ensure the shipping address useEffect runs after addresses update
            if (!wasAddingNew && editedAddressId) {
              previousSelectedAddressIdRef.current = null;
            }

            // Set loading state
            setIsRefreshingAddresses(true);

            void refreshAddresses(wasAddingNew, editedAddressId).then(
              (newAddress) => {
                setIsRefreshingAddresses(false);

                // Track checkout_address_new when new address is added
                if (wasAddingNew && newAddress) {
                  const cityCode =
                    (newAddress.customerAddress as any)?.raw?.region
                      ?.region_code || null;
                  const countryCode = newAddress.customerAddress?.countryCode;
                  trackCheckoutAddressNew(cityCode || undefined, countryCode);
                }

                // When adding a new address, close the drawer without setting view to "list" to prevent flash
                // New address is auto-selected in refreshAddresses
                if (wasAddingNew) {
                  closeAddressDrawerWithoutViewChange();
                } else {
                  closeAddressDrawer();
                }
              }
            );
          }}
        >
          <ManageAddressView />
        </AddressFormContextProvider>
      )}

      {isShippingOptionDrawerOpen && (
        <CheckoutShippingOptionDrawer
          countryCode={
            selectedAddress?.customerAddress?.countryCode ?? undefined
          }
          initialSelectedOption={selectedShippingOption}
          onClose={() => {
            setIsShippingOptionDrawerOpen(false);
            setSelectedShippingOption(null);
          }}
          onConfirm={handleShippingOptionConfirm}
        />
      )}
    </>
  );
}

export default CheckoutPage;
