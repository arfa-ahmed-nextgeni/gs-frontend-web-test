"use client";

import React, { startTransition, useEffect, useEffectEvent } from "react";

import Cookies from "js-cookie";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { useWindowStorageEvent } from "@/hooks/use-window-storage-event";
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
  const storageEvent = useWindowStorageEvent();

  const syncAuthStatus = useEffectEvent(() => {
    const hasAuthToken = Boolean(Cookies.get("auth_token"));

    if (hasAuthToken === state.isAuthorized) {
      return;
    }

    dispatch({ type: hasAuthToken ? "SET_AUTHORIZED" : "SET_UNAUTHORIZED" });
  });

  useEffect(() => {
    syncAuthStatus();

    // Also check periodically to catch any cookie changes (less frequent)
    const interval = setInterval(syncAuthStatus, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (storageEvent.version === 0) {
      return;
    }

    syncAuthStatus();
  }, [storageEvent.version]);

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
