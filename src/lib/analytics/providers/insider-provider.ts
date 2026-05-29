import "client-only";

import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";
import { ProductProperties } from "@/lib/analytics/models/event-models";
import { AnalyticsProvider } from "@/lib/analytics/providers/base-provider";
import {
  buildAddRemoveCartInsiderProperties,
  buildCartInsiderProperties,
  buildPurchaseInsiderProperties,
  buildWishlistViewInsiderProperties,
} from "@/lib/analytics/utils/build-properties";
import { CustomerProperties } from "@/lib/analytics/utils/build-properties";
import { buildUserInsiderProperties } from "@/lib/analytics/utils/build-properties";
import { buildProductInsiderProperties } from "@/lib/analytics/utils/build-properties";
import { COUNTRY_CODE_TO_NAME } from "@/lib/constants/i18n";
import {
  INSIDER_CUSTOM_EVENTS,
  INSIDER_CUSTOMER_KEY_MAP,
  INSIDER_DEFAULT_EVENTS,
  INSIDER_OTHER_EVENTS,
  SEARCH_EVENTS,
} from "@/lib/constants/insider";
import { INSIDER_EXCLUDE_EVENT_PROPERTIES } from "@/lib/constants/insider";
import { INSIDER_EVENT_NAME_MAPPING } from "@/lib/constants/insider";
import { INSIDER_STORE_CONFIG } from "@/lib/constants/insider";
import { loadInsiderScript } from "@/lib/insider/insider-script";

class InsiderAnalyticsProvider implements AnalyticsProvider {
  public tool = ANALYTICS_TOOL.INSIDER;
  private currentLocale: null | string = null;
  private isInitialized = false;

  private lastPushedUser: null | object = null;
  private userPropertiesCache: null | Partial<CustomerProperties> = null;

  identify(): void {}

  async initialize(locale?: string): Promise<void> {
    if (this.isInitialized || typeof window === "undefined") return;

    if (locale) this.currentLocale = locale;

    window.InsiderQueue = [];

    try {
      if (locale && locale in INSIDER_STORE_CONFIG) {
        this.pushLocaleToQueue(locale);
      }

      this.isInitialized = true;

      void loadInsiderScript().catch((error) => {
        console.error("[Insider] Initialization failed:", error);
      });
    } catch (error) {
      console.error("[Insider] Initialization failed:", error);
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && typeof window !== "undefined";
  }

  page(): void {}

  resetUser(): void {
    if (!this.isAvailable()) return;

    try {
      this.pushCustomEvent("logout");
      this.userPropertiesCache = null;
      window.Insider?.reset();
    } catch (error) {
      console.error("[Insider] resetUser error:", error);
    }
  }

  setLocale(locale: string): void {
    this.currentLocale = locale;
  }

  setUserProperties(
    userProperties: null | Partial<Record<string, unknown>>
  ): void {
    if (!userProperties) {
      this.lastPushedUser = null;
      return;
    }

    if (!this.isAvailable()) return;

    try {
      const { customerProperties } = this.splitProperties(
        userProperties as Record<string, unknown>
      );

      this.userPropertiesCache = customerProperties;

      if (Object.keys(customerProperties).length > 0) {
        const userEvent = {
          type: "user",
          value: buildUserInsiderProperties(
            customerProperties as CustomerProperties
          ),
        };

        if (!this.lastPushedUser) {
          window.InsiderQueue?.splice(-2, 0, userEvent);
        }

        this.lastPushedUser = userProperties;
      }
    } catch (error) {
      console.error("[Insider] setUserProperties error:", error);
    }
  }

  track(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isAvailable()) return;

    if (INSIDER_DEFAULT_EVENTS.includes(eventName))
      this.pushDefaultEvent(eventName, properties);
    else if (INSIDER_CUSTOM_EVENTS.includes(eventName))
      this.pushCustomEvent(eventName, properties);
    else if (INSIDER_OTHER_EVENTS.includes(eventName))
      this.pushOtherEvent(eventName, properties);
  }

  private buildEventPayload(
    eventName: string,
    properties: Record<string, unknown>
  ): Record<string, unknown> {
    let eventValue = {};

    switch (eventName) {
      case "add_to_cart":
        eventValue = buildAddRemoveCartInsiderProperties(properties);
        break;
      case "cart_remove":
        eventValue = buildAddRemoveCartInsiderProperties(properties);
        break;
      case "other":
        eventValue = { name: properties?.["eventName"] ?? "" };
        break;
      case "purchase":
        eventValue = buildPurchaseInsiderProperties(properties);
        break;
      case "view_cart":
        eventValue = buildCartInsiderProperties(properties);
        break;
      case "view_category":
        eventValue = { breadcrumb: [properties?.["category.name"] ?? ""] };
        break;
      case "view_product":
        eventValue = buildProductInsiderProperties(
          properties as unknown as ProductProperties
        );
        break;
    }

    return eventValue;
  }

  private languageChange(properites?: Record<string, unknown>) {
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

  private pushCustomEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.isAvailable()) return;

    let hasProperties = properties && Object.keys(properties).length > 0;

    if (INSIDER_EXCLUDE_EVENT_PROPERTIES.includes(eventName))
      hasProperties = undefined;

    const eventValue: Record<string, unknown> = {
      event_name: INSIDER_EVENT_NAME_MAPPING[eventName],
    };

    if (
      hasProperties &&
      (eventName === "add_to_wishlist" || eventName === "cart_to_wishlist")
    ) {
      const eventParameters = buildProductInsiderProperties(
        properties as unknown as ProductProperties
      );

      if (this.currentLocale && this.currentLocale in INSIDER_STORE_CONFIG) {
        const currency =
          INSIDER_STORE_CONFIG[
            this.currentLocale as keyof typeof INSIDER_STORE_CONFIG
          ].currency;

        eventParameters["currency"] = currency ?? "NA";
      }

      eventValue["event_parameters"] = eventParameters;
    }

    if (hasProperties && eventName === "remove_from_wishlist") {
      eventValue["event_parameters"] = { id: properties!["sku"] };
    }

    if (hasProperties && SEARCH_EVENTS.includes(eventName)) {
      eventValue["event_parameters"] = {
        custom: { query: properties!["search_text"] },
      };
    }

    if (hasProperties && eventName === "my_wishlist") {
      const products = properties!["products"] as any[];
      products.map((product) => {
        const params = buildWishlistViewInsiderProperties(product);

        eventValue["event_parameters"] = params;

        window.InsiderQueue?.push({
          type: "custom_event",
          value: [{ ...eventValue }],
        });
      });

      return;
    }

    window.InsiderQueue?.push({
      type: "custom_event",
      value: [{ ...eventValue }],
    });
  }

  private pushDefaultEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.isAvailable()) return;

    if (this.currentLocale && window.InsiderQueue?.length !== 3)
      this.pushLocaleToQueue(this.currentLocale);

    const { customerProperties, eventProperties } = this.splitProperties(
      properties ?? {}
    );

    let userProperties = {};

    if (customerProperties && Object.keys(customerProperties).length > 0)
      userProperties = customerProperties;
    else if (this.userPropertiesCache)
      userProperties = this.userPropertiesCache;

    if (Object.keys(userProperties).length > 0) {
      window.InsiderQueue?.push({
        type: "user",
        value: buildUserInsiderProperties(userProperties as CustomerProperties),
      });
    }

    let eventValue = {};
    eventValue = this.buildEventPayload(eventName, eventProperties);
    this.pushInsider(eventName, eventValue ?? {});
  }

  private pushInsider(
    eventName: string,
    properties: Record<string, unknown>,
    pushInit: boolean = true
  ): void {
    if (!this.isAvailable()) return;

    window.InsiderQueue?.push({
      type: INSIDER_EVENT_NAME_MAPPING[eventName],
      ...(Object.keys(properties).length > 0 && { value: properties }),
    });

    if (pushInit) {
      window.InsiderQueue?.push({ type: "init" });
    }
  }

  private pushLocaleToQueue(locale: string): void {
    const store =
      INSIDER_STORE_CONFIG[locale as keyof typeof INSIDER_STORE_CONFIG];
    const formattedLocale = locale.replace("-", "_");

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

  private pushOtherEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.isAvailable()) return;

    let eventValue = {};

    if (eventName === "add_to_cart" || eventName === "cart_remove") {
      eventValue = buildAddRemoveCartInsiderProperties(properties ?? {});
      this.pushInsider(eventName, eventValue, false);
      return;
    }

    if (eventName === "cart_lessqty" || eventName === "cart_moreqty") {
      eventValue = buildAddRemoveCartInsiderProperties(properties ?? {});
      this.pushInsider("cart_remove", eventValue, false);

      const sku = properties?.["product.sku"] as string;
      const qtyKey = `product.${sku}.qty_in_cart`;
      const qty = properties?.[qtyKey] as number;

      if (eventName === "cart_moreqty" && properties?.[qtyKey]) {
        properties[qtyKey] = qty + 1;
      } else if (eventName === "cart_lessqty" && properties?.[qtyKey]) {
        properties[qtyKey] = qty - 1;
      }

      eventValue = buildAddRemoveCartInsiderProperties(properties ?? {});
      this.pushInsider("add_to_cart", eventValue, false);
      return;
    }

    if (
      eventName === "edit_profile" ||
      eventName === "profile_updated" ||
      eventName === "view_account"
    ) {
      eventValue = this.buildEventPayload("other", { eventName });
      this.pushInsider("other", eventValue);
      return;
    }

    if (eventName === "langauge_pick") {
      this.languageChange(properties);
    }
  }

  private splitProperties(properties: Record<string, unknown>): {
    customerProperties: Partial<CustomerProperties>;
    eventProperties: Record<string, unknown>;
  } {
    const eventProperties: Record<string, unknown> = {};
    const customerProperties: Partial<CustomerProperties> = {};

    Object.entries(properties).forEach(([key, value]) => {
      const customerKey = INSIDER_CUSTOMER_KEY_MAP[key];
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
