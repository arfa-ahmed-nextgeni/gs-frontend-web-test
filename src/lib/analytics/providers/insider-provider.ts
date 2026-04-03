import "client-only";

import { ANALYTICS_TOOL } from "@/lib/analytics/analytics-tool";
import { AnalyticsProvider } from "@/lib/analytics/providers/base-provider";
import { CustomerProperties } from "@/lib/analytics/utils/build-properties";
import { buildUserInsiderProperties } from "@/lib/analytics/utils/build-properties";
import { COUNTRY_CODE_TO_NAME } from "@/lib/constants/i18n";
import { loadInsiderScript } from "@/lib/insider/insider-script";

const PROPERTY_TO_CUSTOMER_KEY_MAP: Record<string, keyof CustomerProperties> = {
  "user.age": "dateOfBirth",
  "user.email": "email",
  "user.gender": "gender",
  "user.id": "id",
  "user.name": "fullName",
  "user.phone": "phoneNumber",
  "user.uuid": "uuid",
  "user.wallet_points": "rewardPointsBalance",
};

const EVENT_NAME_MAPPING: Record<string, string> = {
  home: "home",
  view_category: "category",
};

const STORE_CONFIG: Record<string, { currency: string; lang: string }> = {
  "ar-AE": { currency: "AED", lang: "ar" },
  "ar-GLOBAL": { currency: "USD", lang: "ar" },
  "ar-IQ": { currency: "IQD", lang: "ar" },
  "ar-KW": { currency: "KWD", lang: "ar" },
  "ar-OM": { currency: "OMR", lang: "ar" },
  "ar-SA": { currency: "SAR", lang: "ar" },
  "en-AE": { currency: "AED", lang: "en" },
  "en-GLOBAL": { currency: "USD", lang: "en" },
  "en-IQ": { currency: "IQD", lang: "en" },
  "en-KW": { currency: "KWD", lang: "en" },
  "en-OM": { currency: "OMR", lang: "en" },
  "en-SA": { currency: "SAR", lang: "en" },
} as const;

class InsiderAnalyticsProvider implements AnalyticsProvider {
  public tool = ANALYTICS_TOOL.INSIDER;
  private currentLocale: null | string = null;
  private isInitialized = false;

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    console.info("[Insider] identify:", userId, traits);

    try {
      window.InsiderQueue?.push({
        type: "user",
        value: { id: userId, ...traits },
      });
    } catch (error) {
      console.error("[Insider] identify error:", error);
    }
  }

  async initialize(locale?: string): Promise<void> {
    if (this.isInitialized || typeof window === "undefined") return;

    if (locale) this.currentLocale = locale;

    try {
      if (locale && locale in STORE_CONFIG) {
        this.pushLocaleToQueue(locale);
      }

      await loadInsiderScript();
      this.isInitialized = true;
    } catch (error) {
      console.error("[Insider] Initialization failed:", error);
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && typeof window !== "undefined";
  }

  languageChange(properites?: Record<string, unknown>) {
    if (properites) {
      const { country, Language } = properites;
      const countryCode = Object.keys(COUNTRY_CODE_TO_NAME).find(
        (key) => COUNTRY_CODE_TO_NAME[key] === country
      );

      if (countryCode) {
        this.currentLocale = Language + "-" + countryCode;
      }
    }
  }

  page(name: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;
    console.info("[Insider] page:", name, properties);
  }

  resetUser(): void {
    if (!this.isAvailable()) return;

    try {
      if (this.currentLocale) {
        this.pushLocaleToQueue(this.currentLocale);
        this.pushCustomEvent("logout");
        window.Insider?.reset();
      }
    } catch (error) {
      console.error("[Insider] resetUser error:", error);
    }
  }

  setLocale(locale: string): void {
    this.currentLocale = locale;
  }

  track(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    console.info("[Insider] track:", eventName, properties);

    switch (eventName) {
      case "home":
        this.pushDefaultEvent(eventName, properties);
        break;
      case "langauge_pick":
        this.languageChange(properties);
        break;
      case "logout":
        this.resetUser();
        break;
      case "view_category":
        this.pushDefaultEvent(eventName, properties);
        break;
    }
  }

  private buildEventPayload(
    eventName: string,
    properties?: Record<string, unknown>
  ): Record<string, unknown> {
    let eventValue = {};

    switch (eventName) {
      case "view_category":
        eventValue = { breadcrumb: [properties?.["category.name"] ?? ""] };
        break;
    }

    return {
      type: EVENT_NAME_MAPPING[eventName],
      ...(Object.keys(eventValue).length > 0 && { value: eventValue }),
    };
  }

  private pushCustomEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.isAvailable()) return;

    const hasProperties = properties && Object.keys(properties).length > 0;

    window.InsiderQueue?.push({
      type: "custom_event",
      value: [
        {
          value: {
            event_name: eventName,
            ...(hasProperties && { event_parameters: properties }),
          },
        },
      ],
    });
  }

  private pushDefaultEvent(
    eventName: string,
    properties?: Record<string, unknown>,
    pushInit: boolean = true
  ): void {
    if (!this.isAvailable()) return;

    if (this.currentLocale) this.pushLocaleToQueue(this.currentLocale);

    const { customerProperties, eventProperties } = this.splitProperties(
      properties ?? {}
    );

    if (Object.keys(customerProperties).length > 0) {
      window.InsiderQueue?.push({
        type: "user",
        value: buildUserInsiderProperties(
          customerProperties as CustomerProperties
        ),
      });
    }

    window.InsiderQueue.push(
      this.buildEventPayload(eventName, eventProperties)
    );

    if (pushInit) window.InsiderQueue?.push({ type: "init" });
  }

  private pushLocaleToQueue(locale: string): void {
    const store = STORE_CONFIG[locale as keyof typeof STORE_CONFIG];
    const formattedLocale = locale.replace("-", "_");

    window.InsiderQueue = [];
    window.InsiderQueue.push({
      type: "user",
      value: {
        custom: { locale: formattedLocale },
        language: formattedLocale,
      },
    });
    window.InsiderQueue.push({ type: "currency", value: store.currency });
    window.InsiderQueue.push({ type: "language", value: formattedLocale });
  }

  private splitProperties(properties: Record<string, unknown>): {
    customerProperties: Partial<CustomerProperties>;
    eventProperties: Record<string, unknown>;
  } {
    const eventProperties: Record<string, unknown> = {};
    const customerProperties: Partial<CustomerProperties> = {};

    Object.entries(properties).forEach(([key, value]) => {
      const customerKey = PROPERTY_TO_CUSTOMER_KEY_MAP[key];
      if (customerKey) {
        (customerProperties as Record<string, unknown>)[customerKey] = value;
      } else {
        eventProperties[key] = value;
      }
    });

    return { customerProperties, eventProperties };
  }
}

export const insiderProvider = new InsiderAnalyticsProvider();
