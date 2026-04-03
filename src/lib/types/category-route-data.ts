export interface Category {
  children?: Category[];
  children_count: number;
  id: number;
  include_in_menu: boolean;
  level: number;
  meta_description?: string;
  meta_keywords?: string;
  meta_title?: string;
  name: string;
  product_count?: number;
  uid: string;
  url_key: string;
  url_path: string;
}

export interface CategoryBreadcrumb {
  href: string;
  title: string;
}

export interface CategoryWithBreadcrumbs {
  breadcrumbs: CategoryBreadcrumb[];
  category: Category;
}
