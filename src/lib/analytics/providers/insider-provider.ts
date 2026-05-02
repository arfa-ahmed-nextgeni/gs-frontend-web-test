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
import { INSIDER_CUSTOMER_KEY_MAP } from "@/lib/constants/insider";
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
      if (this.currentLocale) {
        this.pushLocaleToQueue(this.currentLocale);
        this.pushCustomEvent("logout");

        window.Insider?.reset();

        this.userPropertiesCache = null;
      }
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

    console.info("[Insider] track:", eventName, properties);

    switch (eventName) {
      case "add_to_cart":
        this.pushDefaultEvent(eventName, properties, false);
        break;
      case "add_to_wishlist":
        this.pushCustomEvent(eventName, properties);
        break;
      case "cart_lessqty":
        this.cartAddRemoveEvent(eventName, properties);
        break;
      case "cart_moreqty":
        this.cartAddRemoveEvent(eventName, properties);
        break;
      case "cart_remove":
        this.pushDefaultEvent(eventName, properties, false);
      case "cart_clear":
        this.pushCustomEvent(eventName, properties);
        break;
      case "checkout_init":
        this.pushCustomEvent(eventName, properties);
        break;
      case "edit_profile":
        this.otherEvent("view_account", properties);
        break;
      case "home":
        this.pushDefaultEvent(eventName, properties);
        break;
      case "langauge_pick":
        this.languageChange(properties);
        break;
      case "login":
        this.pushCustomEvent(eventName, properties);
        break;
      case "logout":
        this.pushCustomEvent(eventName, properties);
        break;
      case "my_wishlist":
        this.pushCustomEvent(eventName, properties);
        break;
      case "profile_updated":
        this.otherEvent("view_account", properties);
        break;
      case "purchase":
        this.pushDefaultEvent(eventName, properties);
        break;
      case "remove_from_wishlist":
        this.pushCustomEvent(eventName, properties);
        break;
      case "signup":
        this.pushCustomEvent(eventName, properties);
        break;
      case "view_account":
        this.otherEvent(eventName, properties);
        break;
      case "view_cart":
        this.pushDefaultEvent(eventName, properties);
        break;
      case "view_product":
        this.pushDefaultEvent(eventName, properties);
        break;
    }
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

    return {
      type: INSIDER_EVENT_NAME_MAPPING[eventName],
      ...(Object.keys(eventValue).length > 0 && { value: eventValue }),
    };
  }

  private buildOtherEventPayload(eventName: string): Record<string, unknown> {
    return {
      type: "other",
      value: {
        name: eventName,
      },
    };
  }

  private cartAddRemoveEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): void {
    window.InsiderQueue.push(
      this.buildEventPayload("cart_remove", properties ?? {})
    );

    if (!properties) return;

    const sku = properties["product.sku"] as string;
    const qtyKey = `product.${sku}.qty_in_cart`;
    const qty = properties[qtyKey] as number;

    if (eventName === "cart_moreqty" && properties[qtyKey]) {
      properties[qtyKey] = qty + 1;
    } else if (eventName === "cart_lessqty" && properties[qtyKey]) {
      properties[qtyKey] = qty - 1;
    }

    window.InsiderQueue.push(
      this.buildEventPayload("add_to_cart", properties ?? {})
    );
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

  private otherEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.isAvailable()) return;

    if (this.currentLocale) this.pushLocaleToQueue(this.currentLocale);

    const { customerProperties } = this.splitProperties(properties ?? {});

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

    window.InsiderQueue.push(this.buildOtherEventPayload(eventName));
    window.InsiderQueue?.push({ type: "init" });
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

    if (hasProperties && eventName === "add_to_wishlist") {
      const eventParameters = buildProductInsiderProperties(
        properties as unknown as ProductProperties
      );

      eventValue["event_parameters"] = eventParameters;
    }

    if (hasProperties && eventName === "remove_from_wishlist") {
      eventValue["event_parameters"] = { id: properties!["sku"] };
    }

    if (hasProperties && eventName === "my_wishlist") {
      const products = properties!["products"] as any[];
      products.map((product) => {
        const params = buildWishlistViewInsiderProperties(product);

        eventValue["event_parameters"] = params;

        window.InsiderQueue?.push({
          type: "custom_event",
          value: [{ eventValue }],
        });
      });

      return;
    }

    window.InsiderQueue?.push({
      type: "custom_event",
      value: [{ eventValue }],
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

    window.InsiderQueue.push(
      this.buildEventPayload(eventName, eventProperties)
    );

    if (pushInit) window.InsiderQueue?.push({ type: "init" });
  }

  private pushLocaleToQueue(locale: string): void {
    const store =
      INSIDER_STORE_CONFIG[locale as keyof typeof INSIDER_STORE_CONFIG];
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
