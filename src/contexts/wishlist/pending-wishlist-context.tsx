"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { useTranslations } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { useUI } from "@/contexts/use-ui";
import { useWishlist } from "@/contexts/use-wishlist";
import { useAddProductToWishlist } from "@/hooks/mutations/wishlist/use-add-product-to-wishlist";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import {
  restoreScrollPosition,
  shouldSuppressRegistration,
} from "@/lib/utils/auth-redirect";
import {
  getSessionStorage,
  removeSessionStorage,
  setSessionStorage,
} from "@/lib/utils/session-storage";

const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

type PendingAction = {
  selectedOptionId?: string;
  sku: string;
  timestamp: number;
};

type PendingWishlistContextType = {
  addPendingAction: (action: Omit<PendingAction, "timestamp">) => void;
  clearPendingActions: () => void;
};

const PendingWishlistContext = createContext<null | PendingWishlistContextType>(
  null
);

export const PendingWishlistProvider = ({ children }: PropsWithChildren) => {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const { isAuthorized } = useUI();
  const { wishlist } = useWishlist();
  const { mutate: addToWishlist } = useAddProductToWishlist({
    skipSuccessMessage: true,
    sku: "",
  });
  const t = useTranslations("Toast");

  // === Load from sessionStorage on mount ===
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = getSessionStorage(SessionStorageKey.PENDING_WISHLIST_ACTIONS);
      if (!raw) return;

      const parsed: PendingAction[] = JSON.parse(raw);
      const now = Date.now();

      // Filter out expired actions
      const validActions = parsed.filter(
        (action) => now - action.timestamp < MAX_AGE_MS
      );

      setPendingActions(validActions);

      // Clean up storage if all expired
      if (validActions.length === 0) {
        removeSessionStorage(SessionStorageKey.PENDING_WISHLIST_ACTIONS);
      } else {
        setSessionStorage(
          SessionStorageKey.PENDING_WISHLIST_ACTIONS,
          JSON.stringify(validActions)
        );
      }
    } catch (error) {
      console.warn("Failed to parse pending wishlist actions", error);
      removeSessionStorage(SessionStorageKey.PENDING_WISHLIST_ACTIONS);
    }
  }, []);

  // === Save to sessionStorage whenever pendingActions change ===
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (pendingActions.length > 0) {
      setSessionStorage(
        SessionStorageKey.PENDING_WISHLIST_ACTIONS,
        JSON.stringify(pendingActions)
      );
    } else {
      removeSessionStorage(SessionStorageKey.PENDING_WISHLIST_ACTIONS);
    }
  }, [pendingActions]);

  // === Restore scroll position after login ===
  useEffect(() => {
    if (!isAuthorized || typeof window === "undefined") return;

    // Check if we should restore scroll (user came from wishlist click on mobile)
    const shouldRestore = shouldSuppressRegistration();
    if (!shouldRestore) return;

    // Restore scroll position with longer delay to ensure page is fully loaded
    const timeoutId = setTimeout(() => {
      restoreScrollPosition();

      // Try again after a short delay in case the first attempt didn't work
      setTimeout(() => {
        restoreScrollPosition();
      }, 300);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [isAuthorized]);

  // === Execute pending actions after login + wishlist loaded ===
  useEffect(() => {
    if (!isAuthorized || !wishlist?.id || pendingActions.length === 0) return;

    const wishlistId = wishlist.id;
    let successCount = 0;
    const totalActions = pendingActions.length;

    pendingActions.forEach((action) => {
      const payload = {
        selectedOptionId: action.selectedOptionId,
        sku: action.sku,
        wishlistId,
      };

      addToWishlist(payload, {
        onError: () => {
          // Optionally retry or notify user
          // For now: keep in queue
        },
        onSuccess: () => {
          successCount++;
          removeActionFromQueue(action);

          if (successCount === totalActions) {
            setTimeout(() => {
              toast({
                description: t("wishlistPendingExecuted.description"),
                title: t("wishlistPendingExecuted.message"),
                type: "success",
              });
            }, 3000);
          }
        },
      });
    });

    // Clear queue after attempting all
    setPendingActions([]);
  }, [isAuthorized, wishlist?.id, pendingActions, addToWishlist, t]);

  // === Helper: Remove specific action ===
  const removeActionFromQueue = (actionToRemove: PendingAction) => {
    setPendingActions((prev) =>
      prev.filter(
        (a) =>
          a.sku !== actionToRemove.sku ||
          a.selectedOptionId !== actionToRemove.selectedOptionId
      )
    );
  };

  // === Add new pending action (with deduplication) ===
  const addPendingAction = (action: Omit<PendingAction, "timestamp">) => {
    const newAction: PendingAction = {
      ...action,
      timestamp: Date.now(),
    };

    setPendingActions((prev) => {
      // Avoid duplicates
      const exists = prev.some(
        (a) =>
          a.sku === newAction.sku &&
          a.selectedOptionId === newAction.selectedOptionId
      );
      if (exists) return prev;

      return [...prev, newAction];
    });
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    if (typeof window !== "undefined") {
      removeSessionStorage(SessionStorageKey.PENDING_WISHLIST_ACTIONS);
    }
  };

  return (
    <PendingWishlistContext.Provider
      value={{ addPendingAction, clearPendingActions }}
    >
      {children}
    </PendingWishlistContext.Provider>
  );
};

// === Hook ===
export const usePendingWishlist = (): PendingWishlistContextType => {
  const context = useContext(PendingWishlistContext);
  if (!context) {
    throw new Error(
      "usePendingWishlist must be used within PendingWishlistProvider"
    );
  }
  return context;
};
