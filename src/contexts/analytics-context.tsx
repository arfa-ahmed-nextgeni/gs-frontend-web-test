"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLocale } from "next-intl";

import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { useUserProperties } from "@/hooks/analytics/use-user-properties";
import { getAnalyticsManagerToolsEnabledByCookieConsent } from "@/lib/analytics/analytics-cookie-consent-policy";
import {
  analyticsManager,
  type TrackOptions,
} from "@/lib/analytics/analytics-manager";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { removeSessionStorage } from "@/lib/utils/session-storage";

interface AnalyticsContextValue {
  hasUserPropertiesSet: boolean;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  isReady: boolean;
  page: (name: string, properties?: Record<string, unknown>) => void;
  track: (
    eventName: string,
    optionsOrProperties?: Record<string, unknown> | TrackOptions
  ) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [hasUserPropertiesSet, setHasUserPropertiesSet] = useState(false);
  const [readyToolsKey, setReadyToolsKey] = useState("");
  // Tracks the tools key currently being initialized so we can dedupe
  // overlapping requests and ignore stale completions after consent changes.
  const initializingToolsKeyRef = useRef<null | string>(null);
  const locale = useLocale();
  const { cookieConsentStatus } = useCookieConsent();
  const userProperties = useUserProperties();
  const enabledAnalyticsManagerTools = useMemo(
    () =>
      getAnalyticsManagerToolsEnabledByCookieConsent({
        cookieConsentStatus,
      }),
    [cookieConsentStatus]
  );
  const enabledAnalyticsManagerToolsKey = useMemo(
    () => enabledAnalyticsManagerTools.join("|"),
    [enabledAnalyticsManagerTools]
  );
  const isReady =
    enabledAnalyticsManagerTools.length > 0 &&
    readyToolsKey === enabledAnalyticsManagerToolsKey;

  // Keep enabled tools in sync before child effects fire, so early page/track
  // calls can be queued against the correct analytics configuration.
  useLayoutEffect(() => {
    analyticsManager.setEnabledTools(enabledAnalyticsManagerTools);
  }, [enabledAnalyticsManagerTools]);

  // Update locale in analytics manager when it changes
  useEffect(() => {
    if (locale) {
      analyticsManager.setLocale(locale);
    }
  }, [locale]);

  // Update user properties in analytics manager when they change
  useEffect(() => {
    analyticsManager.setUserProperties(userProperties ?? null);
    if (userProperties) setHasUserPropertiesSet(true);
  }, [userProperties]);

  const initializeAnalytics = useCallback(async () => {
    if (cookieConsentStatus === "loading") return;
    if (enabledAnalyticsManagerTools.length === 0) {
      initializingToolsKeyRef.current = null;
      if (readyToolsKey) {
        setReadyToolsKey("");
      }
      return;
    }
    if (
      readyToolsKey === enabledAnalyticsManagerToolsKey ||
      initializingToolsKeyRef.current === enabledAnalyticsManagerToolsKey
    ) {
      return;
    }

    const requestedToolsKey = enabledAnalyticsManagerToolsKey;
    initializingToolsKeyRef.current = requestedToolsKey;

    try {
      await analyticsManager.initialize(locale);

      // Only mark ready if the same tool set is still the active initialization target.
      if (initializingToolsKeyRef.current === requestedToolsKey) {
        setReadyToolsKey(requestedToolsKey);
      }
    } catch (error) {
      console.error("Failed to initialize analytics manager: ", error);
    } finally {
      if (initializingToolsKeyRef.current === requestedToolsKey) {
        initializingToolsKeyRef.current = null;
      }
    }
  }, [
    enabledAnalyticsManagerTools.length,
    enabledAnalyticsManagerToolsKey,
    locale,
    readyToolsKey,
    cookieConsentStatus,
  ]);

  useEffect(() => {
    // Allow analyticsManager.track/page/identify to bootstrap initialization
    // on first real usage while keeping the public event API unchanged.
    analyticsManager.setRequestInitialization(initializeAnalytics);

    return () => {
      analyticsManager.setRequestInitialization(null);
    };
  }, [initializeAnalytics]);

  useEffect(() => {
    if (
      cookieConsentStatus === "loading" ||
      enabledAnalyticsManagerTools.length === 0 ||
      isReady
    ) {
      return;
    }

    // Warm analytics up after hydration when the browser is idle so launch and
    // user-property flows still work even if the user never triggers an event.
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(initializeAnalytics);

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(initializeAnalytics, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    cookieConsentStatus,
    enabledAnalyticsManagerTools.length,
    isReady,
    initializeAnalytics,
  ]);

  useEffect(() => {
    const handlePageHide = () => {
      removeSessionStorage(SessionStorageKey.ANALYTICS_LAUNCH_TRACKED);
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  // Stable context value - updates when isReady changes
  const value = useMemo(
    () => ({
      hasUserPropertiesSet,
      identify: analyticsManager.identify.bind(analyticsManager),
      isReady,
      page: analyticsManager.page.bind(analyticsManager),
      track: analyticsManager.track.bind(analyticsManager),
    }),
    [isReady, hasUserPropertiesSet]
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return context;
}
