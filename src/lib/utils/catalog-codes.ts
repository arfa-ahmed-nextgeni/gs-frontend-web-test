import "server-only";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { Locale } from "@/lib/constants/i18n";
import { Store } from "@/lib/models/stores";

/**
 * Get Store object with catalog codes from API
 * This is a server-only function
 */
export async function getStoreWithCatalogCodes(
  locale: Locale
): Promise<null | Store> {
  try {
    const storeConfigResult = await getStoreConfig({ locale });

    if (storeConfigResult.data?.store) {
      return storeConfigResult.data.store;
    }

    return null;
  } catch (error) {
    console.error("Error getting store with catalog codes:", error);
    return null;
  }
}
