"use client";

import React, { startTransition, useCallback, useEffect } from "react";

import Cookies from "js-cookie";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "@/i18n/navigation";
import { trackFilterClose, trackFilterOpen } from "@/lib/analytics/events";

import { initialState, uiReducer } from "./ui.reducer";
import { DRAWER_VIEWS, State } from "./ui.types";

export const UIContext = React.createContext<any | State>(initialState);
UIContext.displayName = "UIContext";

export const UIProvider: React.FC<React.PropsWithChildren<object>> = ({
  children,
}) => {
  const router = useRouter();
  const [state, dispatch] = React.useReducer(uiReducer, initialState);

  const isMobile = useIsMobile();

  const checkAuthStatus = useCallback(() => {
    const authToken = Cookies.get("auth_token");
    if (authToken) {
      dispatch({ type: "SET_AUTHORIZED" });
    } else {
      dispatch({ type: "SET_UNAUTHORIZED" });
    }
  }, []);

  useEffect(() => {
    // Check on mount
    checkAuthStatus();

    // Listen for storage events (when cookie changes in other tabs/windows)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically to catch any cookie changes (less frequent)
    const interval = setInterval(checkAuthStatus, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuthStatus]);

  const value = React.useMemo(
    () => ({
      ...state,
      authorize: () => {
        startTransition(() => {
          if (!isMobile) {
            router.refresh();
          }
        });
        dispatch({ type: "SET_AUTHORIZED" });
      },
      closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
      closeFilter: () => {
        trackFilterClose();
        dispatch({ type: "CLOSE_FILTER" });
      },
      closeMobileSearch: () => dispatch({ type: "CLOSE_MOBILE_SEARCH" }),
      closeSearch: () => dispatch({ type: "CLOSE_SEARCH" }),
      closeSidebar: () => dispatch({ type: "CLOSE_SIDEBAR" }),
      openDrawer: (data?: any) => dispatch({ data, type: "OPEN_DRAWER" }),
      openFilter: () => {
        trackFilterOpen();
        dispatch({ type: "OPEN_FILTER" });
      },
      openMobileSearch: () => dispatch({ type: "OPEN_MOBILE_SEARCH" }),
      openSearch: () => dispatch({ type: "OPEN_SEARCH" }),
      openSidebar: () => dispatch({ type: "OPEN_SIDEBAR" }),
      setDrawerView: (view: DRAWER_VIEWS) =>
        dispatch({ type: "SET_DRAWER_VIEW", view }),
      toggleMobileSearch: () =>
        state.displayMobileSearch
          ? dispatch({ type: "CLOSE_MOBILE_SEARCH" })
          : dispatch({ type: "OPEN_MOBILE_SEARCH" }),
      unauthorize: () => {
        Cookies.remove("auth_token");
        router.refresh();
        dispatch({ type: "SET_UNAUTHORIZED" });
      },
    }),
    [isMobile, router, state]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
