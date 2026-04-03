import type { Locale } from "@/lib/constants/i18n";
import type { CategoryBreadcrumb } from "@/lib/types/category-route-data";
import type { CategoryRouteShellNode } from "@/lib/types/category-route-shell";

type CategoryRouteShellBreadcrumbNode = NonNullable<
  NonNullable<CategoryRouteShellNode["breadcrumbs"]>[number]
>;

export class CategoryBreadcrumbsModel {
  breadcrumbs: CategoryBreadcrumb[] = [];

  constructor(
    categoryNode: CategoryRouteShellNode | undefined,
    locale: Locale
  ) {
    if (!categoryNode) {
      return;
    }

    this.breadcrumbs = this.mapBreadcrumbs(categoryNode, locale);
  }

  private mapBreadcrumbs(
    categoryNode: CategoryRouteShellNode,
    locale: Locale
  ): CategoryBreadcrumb[] {
    const breadcrumbs: CategoryBreadcrumb[] = [];

    const isArabic = locale.toLowerCase().startsWith("ar");
    breadcrumbs.push({
      href: "/",
      title: isArabic ? "الرئيسية" : "Home",
    });

    const ancestorBreadcrumbs = (categoryNode.breadcrumbs || [])
      .filter((item): item is CategoryRouteShellBreadcrumbNode => item !== null)
      .sort(
        (first, second) =>
          (first.category_level || 0) - (second.category_level || 0)
      );

    for (const breadcrumb of ancestorBreadcrumbs) {
      const breadcrumbPath = this.normalizePath(breadcrumb.category_url_path);
      const breadcrumbTitle = breadcrumb.category_name?.trim();

      if (!breadcrumbPath || !breadcrumbTitle) {
        continue;
      }

      this.pushUniqueBreadcrumb(breadcrumbs, {
        href: `/c/${breadcrumbPath}`,
        title: breadcrumbTitle,
      });
    }

    const currentCategoryPath = this.normalizePath(
      categoryNode.url_path || categoryNode.url_key
    );
    const currentCategoryTitle = categoryNode.name?.trim();

    if (currentCategoryPath && currentCategoryTitle) {
      this.pushUniqueBreadcrumb(breadcrumbs, {
        href: `/c/${currentCategoryPath}`,
        title: currentCategoryTitle,
      });
    }

    return breadcrumbs;
  }

  private normalizePath(path: null | string | undefined): string {
    return (path || "").trim().replace(/^\/+|\/+$/g, "");
  }

  private pushUniqueBreadcrumb(
    breadcrumbs: CategoryBreadcrumb[],
    breadcrumb: CategoryBreadcrumb
  ) {
    if (breadcrumbs.some((item) => item.href === breadcrumb.href)) {
      return;
    }

    breadcrumbs.push(breadcrumb);
  }
}
