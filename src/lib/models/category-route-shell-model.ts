import { CategoryBreadcrumbsModel } from "@/lib/models/category-breadcrumbs-model";
import { CategoryModel } from "@/lib/models/category-model";
import { type CategoryRouteShellNode } from "@/lib/types/category-route-shell";

import type { GetCategoryRouteShellByPathQuery } from "@/graphql/graphql";
import type { Locale } from "@/lib/constants/i18n";
import type {
  Category,
  CategoryBreadcrumb,
} from "@/lib/types/category-route-data";

interface CategoryRouteShellModelArgs {
  data: GetCategoryRouteShellByPathQuery | undefined;
  locale: Locale;
  urlPath: string;
}

export class CategoryRouteShellModel {
  breadcrumbs: CategoryBreadcrumb[] = [];
  category: Category;
  categoryPath = "";
  routePath = "";

  constructor({ data, locale, urlPath }: CategoryRouteShellModelArgs) {
    this.routePath = `/c/${urlPath}`;

    const categoryNode = data?.categories?.items?.find(
      (item): item is CategoryRouteShellNode => Boolean(item?.uid)
    );

    const categoryModel = new CategoryModel(categoryNode);
    const breadcrumbsModel = new CategoryBreadcrumbsModel(categoryNode, locale);

    this.category = categoryModel.category;
    this.categoryPath = this.category.url_path || this.category.url_key;
    this.breadcrumbs = breadcrumbsModel.breadcrumbs;
  }
}
