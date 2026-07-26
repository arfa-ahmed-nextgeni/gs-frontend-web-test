import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CATEGORY_SHELL_CACHE_DISABLED } from "@/lib/config/server-env";
import { CATEGORIES_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/categories";
import { CacheTags } from "@/lib/constants/cache/tags";
import { type Locale } from "@/lib/constants/i18n";
import { CategoryRouteShellModel } from "@/lib/models/category-route-shell-model";
import { retryNetworkRequest } from "@/lib/utils/network-error";
import { failure, ok } from "@/lib/utils/service-result";

export const getCategoryRouteShell = ({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string[];
}) => {
  const urlPath = slug.join("/");
  return CATEGORY_SHELL_CACHE_DISABLED
    ? getCategoryRouteShellRequestCached(locale, urlPath)
    : getCategoryRouteShellPersistent(locale, urlPath);
};

const fetchRouteShell = async (locale: Locale, urlPath: string) => {
  try {
    if (!urlPath) {
      return failure("Category not found");
    }

    const storeConfig = await getStoreConfig({ locale });

    if (!storeConfig.data?.store) {
      return failure("Store config not available");
    }

    const response = await retryNetworkRequest(() =>
      graphqlRequest({
        httpMethod: "GET",
        operationName: "GetCategoryRouteShellByPath",
        query: CATEGORIES_GRAPHQL_QUERIES.GET_CATEGORY_ROUTE_SHELL_BY_PATH,
        storeCode: storeConfig.data.store!.code,
        variables: {
          urlPath,
        },
      })
    );

    const routeShell = new CategoryRouteShellModel({
      data: response.data,
      locale,
      urlPath,
    });

    if (!routeShell.category.uid) {
      return failure("Category not found");
    }

    return ok(structuredClone(routeShell));
  } catch (error) {
    console.error("Failed to get category route shell:", error, {
      locale,
      urlPath,
    });
    return failure("Failed to get category route shell");
  }
};

const getCategoryRouteShellRequestCached = cache(fetchRouteShell);

const getCategoryRouteShellPersistent = cache(
  async (locale: Locale, urlPath: string) => {
    "use cache";
    cacheTag(CacheTags.Magento, CacheTags.CategoryRouteShell);
    return fetchRouteShell(locale, urlPath);
  }
);
