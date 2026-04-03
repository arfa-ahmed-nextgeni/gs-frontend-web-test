import "server-only";

import { cache } from "react";

import { graphqlRequest } from "@/lib/clients/graphql";
import { CATEGORIES_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/categories";
import { CacheTags } from "@/lib/constants/cache/tags";
import { type Locale } from "@/lib/constants/i18n";
import { CategoryRouteShellModel } from "@/lib/models/category-route-shell-model";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

export const getCategoryRouteShell = ({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string[];
}) => getCategoryRouteShellCached(locale, slug.join("/"));

const getCategoryRouteShellCached = cache(
  async (locale: Locale, urlPath: string) => {
    try {
      if (!urlPath) {
        return failure("Category not found");
      }

      const response = await graphqlRequest({
        query: CATEGORIES_GRAPHQL_QUERIES.GET_CATEGORY_ROUTE_SHELL_BY_PATH,
        requestInit: {
          next: {
            revalidate: 900,
            tags: [CacheTags.Magento],
          },
        },
        skipUserAgentHeader: true,
        storeCode: getStoreCode(locale),
        variables: {
          urlPath,
        },
      });

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
      console.error("Failed to get category route shell:", error);
      return failure("Failed to get category route shell");
    }
  }
);
