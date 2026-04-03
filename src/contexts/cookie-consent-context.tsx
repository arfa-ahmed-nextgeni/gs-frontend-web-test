"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { deleteCookie, getCookie, setCookie } from "cookies-next/client";

import { CookieName } from "@/lib/constants/cookies";

import type { CookieConsentPromptModel } from "@/lib/models/cookie-consent-prompt-model";
import type { CookieConsentStatus } from "@/lib/types/cookie-consent";

type CookieConsentContextValue = {
  acceptCookies: () => void;
  cookieConsentStatus: CookieConsentStatus;
  declineCookies: () => void;
};

const COOKIE_CONSENT_COOKIE_EXPIRY_DAYS = 180;
const COOKIE_CONSENT_COOKIE_MAX_AGE_SECONDS =
  COOKIE_CONSENT_COOKIE_EXPIRY_DAYS * 24 * 60 * 60;

type CookieConsentDecision = "accepted" | "declined";

type CookieConsentState = {
  resolvedConsentVersion: null | string;
  storedConsent: null | PersistedCookieConsent;
};

type PersistedCookieConsent = {
  decision: CookieConsentDecision;
  version: string;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

export function CookieConsentProvider({
  children,
  cookieConsentPrompt,
}: PropsWithChildren<{
  cookieConsentPrompt?: CookieConsentPromptModel;
}>) {
  const consentVersion = cookieConsentPrompt?.consentVersion;
  const isConsentRequired = Boolean(
    cookieConsentPrompt?.enabled && consentVersion
  );
  const [consentState, setConsentState] = useState<CookieConsentState>({
    resolvedConsentVersion: null,
    storedConsent: null,
  });

  useEffect(() => {
    if (!isConsentRequired || !consentVersion) {
      setConsentState({
        resolvedConsentVersion: null,
        storedConsent: null,
      });
      return;
    }

    setConsentState({
      resolvedConsentVersion: consentVersion,
      storedConsent: readStoredCookieConsent(consentVersion),
    });
  }, [consentVersion, isConsentRequired]);

  const cookieConsentStatus = getCookieConsentStatus({
    consentState,
    consentVersion,
    isConsentRequired,
  });

  const acceptCookies = useCallback(() => {
    if (!consentVersion) {
      return;
    }

    const nextConsent = {
      decision: "accepted",
      version: consentVersion,
    } satisfies PersistedCookieConsent;

    setCookie(CookieName.COOKIE_CONSENT, JSON.stringify(nextConsent), {
      maxAge: COOKIE_CONSENT_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    setConsentState({
      resolvedConsentVersion: consentVersion,
      storedConsent: nextConsent,
    });
  }, [consentVersion]);

  const declineCookies = useCallback(() => {
    if (!consentVersion) {
      return;
    }

    deleteCookie(CookieName.COOKIE_CONSENT);
    setConsentState({
      resolvedConsentVersion: consentVersion,
      storedConsent: {
        decision: "declined",
        version: consentVersion,
      },
    });
  }, [consentVersion]);

  const value = useMemo(
    () => ({
      acceptCookies,
      cookieConsentStatus,
      declineCookies,
    }),
    [acceptCookies, cookieConsentStatus, declineCookies]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider"
    );
  }

  return context;
}

function getCookieConsentStatus({
  consentState,
  consentVersion,
  isConsentRequired,
}: {
  consentState: CookieConsentState;
  consentVersion?: string;
  isConsentRequired: boolean;
}): CookieConsentStatus {
  if (!isConsentRequired || !consentVersion) {
    return "disabled";
  }

  if (consentState.resolvedConsentVersion !== consentVersion) {
    return "loading";
  }

  if (!consentState.storedConsent) {
    return "pending";
  }

  return consentState.storedConsent.decision;
}

function isPersistedCookieConsent(
  value: unknown
): value is PersistedCookieConsent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const consent = value as Partial<PersistedCookieConsent>;

  return (
    (consent.decision === "accepted" || consent.decision === "declined") &&
    typeof consent.version === "string"
  );
}

function readStoredCookieConsent(requiredVersion: string) {
  const rawCookieValue = getCookie(CookieName.COOKIE_CONSENT);

  if (!rawCookieValue) {
    return null;
  }

  try {
    const parsedCookieValue = JSON.parse(String(rawCookieValue));

    if (
      !isPersistedCookieConsent(parsedCookieValue) ||
      parsedCookieValue.decision === "declined" ||
      parsedCookieValue.version !== requiredVersion
    ) {
      deleteCookie(CookieName.COOKIE_CONSENT);
      return null;
    }

    return parsedCookieValue;
  } catch {
    deleteCookie(CookieName.COOKIE_CONSENT);
    return null;
  }
}
