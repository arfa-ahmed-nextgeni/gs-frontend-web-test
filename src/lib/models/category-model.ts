import type { Category } from "@/lib/types/category-route-data";
import type { CategoryRouteShellNode } from "@/lib/types/category-route-shell";

type CategoryRouteShellChildNode = NonNullable<
  NonNullable<CategoryRouteShellNode["children"]>[number]
>;

export class CategoryModel {
  category: Category;

  constructor(categoryNode: CategoryRouteShellNode | undefined) {
    this.category = this.createEmptyCategory();

    if (!categoryNode) {
      return;
    }

    this.category = this.mapCategoryNode(categoryNode);
  }

  private createEmptyCategory(): Category {
    return {
      children: [],
      children_count: 0,
      id: 0,
      include_in_menu: false,
      level: 0,
      meta_description: undefined,
      meta_keywords: undefined,
      meta_title: undefined,
      name: "",
      product_count: undefined,
      uid: "",
      url_key: "",
      url_path: "",
    };
  }

  private mapCategoryNode(categoryNode: CategoryRouteShellNode): Category {
    return {
      children: (categoryNode.children || [])
        .filter((child): child is CategoryRouteShellChildNode => child !== null)
        .map((child) => this.mapChildCategoryNode(child)),
      children_count: this.parseChildrenCount(categoryNode.children_count),
      id: categoryNode.id || 0,
      include_in_menu: Boolean(categoryNode.include_in_menu),
      level: categoryNode.level || 0,
      meta_description: categoryNode.meta_description || undefined,
      meta_keywords: categoryNode.meta_keywords || undefined,
      meta_title: categoryNode.meta_title || undefined,
      name: categoryNode.name || "",
      product_count: categoryNode.product_count || undefined,
      uid: categoryNode.uid || "",
      url_key: categoryNode.url_key || "",
      url_path: categoryNode.url_path || "",
    };
  }

  private mapChildCategoryNode(
    childNode: CategoryRouteShellChildNode
  ): Category {
    return {
      children: [],
      children_count: 0,
      id: childNode.id || 0,
      include_in_menu: true,
      level: 0,
      meta_description: undefined,
      meta_keywords: undefined,
      meta_title: undefined,
      name: childNode.name || "",
      product_count: childNode.product_count || undefined,
      uid: childNode.uid || "",
      url_key: childNode.url_key || "",
      url_path: childNode.url_path || "",
    };
  }

  private parseChildrenCount(
    childrenCount: null | number | string | undefined
  ): number {
    const parsedValue = Number(childrenCount);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }
}
