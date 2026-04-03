import "client-only";

import {
  INSIDER_PARTNER_ID,
  INSIDER_PARTNER_NAME,
} from "@/lib/config/client-env";

/**
 * Injects the Insider vanilla JS snippet into <head> without blocking the UI.
 *
 * Uses `requestIdleCallback` (with `setTimeout` fallback) so the script
 * is loaded only when the browser is idle, preserving LCP / FID scores.
 *
 * @returns A promise that resolves once the Insider script has loaded,
 *          or rejects if the script fails to load.
 */
export function loadInsiderScript(): Promise<void> {
  if (!INSIDER_PARTNER_NAME) {
    return Promise.reject(new Error("Insider partner name is not configured."));
  }

  if (!INSIDER_PARTNER_ID) {
    return Promise.reject(new Error("Insider partner id is not configured."));
  }

  if (isInsiderScriptLoaded()) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const inject = () => {
      try {
        const script = document.createElement("script");
        script.src = `https://${INSIDER_PARTNER_NAME}.api.useinsider.com/ins.js?id=${INSIDER_PARTNER_ID}`;
        script.async = true;
        script.dataset.insider = "insider-script";

        script.onload = () => resolve();
        script.onerror = () => {
          reject(new Error("Failed to load Insider script."));
        };

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(inject, { timeout: 3000 });
    } else {
      setTimeout(inject, 1000);
    }
  });
}

/**
 * Checks if the Insider script has already been injected into the DOM
 */
function isInsiderScriptLoaded(): boolean {
  return !!document.querySelector('script[data-insider="insider-script"]');
}
