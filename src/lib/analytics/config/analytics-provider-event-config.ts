import { ANALYTICS_TOOL } from "@/lib/analytics/constants/analytics-tool";

import type { AnalyticsTool } from "@/lib/types/analytics";

type ProviderEventConfig = Partial<
  Record<AnalyticsTool, Record<string, null | string>>
>;

/**
 * Per-provider event routing overrides.
 * - Use a string to rename an event for one provider.
 * - Use null to skip an event for one provider.
 * - Omit an event to keep its canonical name.
 */
const ANALYTICS_PROVIDER_EVENT_CONFIG: ProviderEventConfig = {
  [ANALYTICS_TOOL.GOOGLE_TAG_MANAGER]: {
    cart_lessqty: "add_to_cart",
    cart_moreqty: "add_to_cart",
    cart_to_wishlist: "add_to_wishlist",
    cat_beauty_items_sold: null,
    cat_fragrance_items_sold: null,
    cat_mix_items_sold: null,
    desktop_navigation: null,
    g_purchase: null,
    purchase: null,
    purchase_success: null,
    Revenue: null,
    search_page_init: "view_catalog",
    view_category: "view_catalog",
  },
};

export function resolveAnalyticsProviderEventName(
  tool: AnalyticsTool,
  eventName: string,
  routingKey = eventName
): null | string {
  const configuredEventName =
    ANALYTICS_PROVIDER_EVENT_CONFIG[tool]?.[routingKey];

  return configuredEventName === undefined ? eventName : configuredEventName;
}
