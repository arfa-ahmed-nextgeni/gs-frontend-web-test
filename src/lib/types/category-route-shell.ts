import type { GetCategoryRouteShellByPathQuery } from "@/graphql/graphql";

export type CategoryRouteShellNode = NonNullable<CategoryRouteShellItem>;

type CategoryRouteShellItem = NonNullable<
  NonNullable<GetCategoryRouteShellByPathQuery["categories"]>["items"]
>[number];
