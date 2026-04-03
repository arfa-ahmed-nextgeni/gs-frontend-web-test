"use server";

import { cache } from "react";

import { deleteCookie, getCookie, setCookie } from "@/lib/actions/cookies";
import { CookieName } from "@/lib/constants/cookies";
import { PendingOrderInfo } from "@/lib/types/checkout/order";

function getCookieDomainFromBaseUrl(baseUrl: string): string | undefined {
  if (process.env.NODE_ENV !== "production") {
    return undefined;
  }

  try {
    const hostname = new URL(baseUrl).hostname;

    const parts = hostname.split(".");

    // If it's localhost or has port, don't set domain (browser restrictions)
    if (hostname === "localhost" || hostname.includes("localhost:")) {
      return undefined;
    }

    // Handle common cases:
    // - example.com → parts = ['example', 'com'] → return '.example.com'
    // - ae.example.com → parts = ['ae', 'example', 'com'] → return '.example.com'
    // - sub.sub.example.co.uk → parts = ['sub', 'sub', 'example', 'co', 'uk'] → keep last 2 or more?

    // Simple & safe: assume the root domain is the last two parts (e.g., example.com, co.uk)
    if (parts.length > 2) {
      // Remove the subdomain part
      parts.shift(); // remove 'ae', 'kw', etc.
    }

    const rootDomain = parts.join(".");

    // Return with leading dot for cross-subdomain sharing
    return `.${rootDomain}`;
  } catch {
    return undefined;
  }
}

export const getPendingOrderInfo = cache(async () => {
  const pendingOrderInfo = await getCookie(CookieName.PENDING_ORDER_INFO);

  return pendingOrderInfo
    ? (JSON.parse(pendingOrderInfo) as PendingOrderInfo)
    : null;
});

export async function deletePendingOrderInfo(baseUrl: string) {
  const domain = getCookieDomainFromBaseUrl(baseUrl);

  await deleteCookie(CookieName.PENDING_ORDER_INFO, {
    domain,
  });
}

export async function setPendingOrderInfo(pendingOrderInfo: PendingOrderInfo) {
  const domain = getCookieDomainFromBaseUrl(pendingOrderInfo.baseUrl);

  await setCookie(
    CookieName.PENDING_ORDER_INFO,
    JSON.stringify(pendingOrderInfo),
    {
      domain,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    }
  );
}

/**
 * Get the Payfort response code from cookie
 * Used to track the response code from authorize-capture step
 */
export const getPayfortResponseCode = cache(async () => {
  const responseCode = await getCookie(CookieName.PAYFORT_RESPONSE_CODE);

  return responseCode;
});

/**
 * Delete the Payfort response code cookie
 * Used after processing the payment callback
 */
export async function deletePayfortResponseCode(baseUrl: string) {
  const domain = getCookieDomainFromBaseUrl(baseUrl);

  await deleteCookie(CookieName.PAYFORT_RESPONSE_CODE, {
    domain,
  });
}

/**
 * Set the Payfort response code cookie
 * Used after authorize-capture to store the response code for callback handling
 */
export async function setPayfortResponseCode({
  baseUrl,
  responseCode,
}: {
  baseUrl: string;
  responseCode: string;
}) {
  const domain = getCookieDomainFromBaseUrl(baseUrl);

  await setCookie(CookieName.PAYFORT_RESPONSE_CODE, responseCode, {
    domain,
    httpOnly: true,
    maxAge: 60 * 60, // 1 hour
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
