"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface CategoryInfo {
  children_count?: number;
  include_in_menu?: boolean;
  level?: number;
  name: string;
  product_count?: number;
  uid: string;
  url_key: string;
  url_path?: string;
}

interface CategoryTypeFilterProps {
  children?: CategoryInfo[];
  currentCategory: CategoryInfo;
  parentCategories?: CategoryInfo[];
}

export const CategoryTypeFilter = ({
  children,
  currentCategory,
  parentCategories = [],
}: CategoryTypeFilterProps) => {
  const getCategoryHref = (category: CategoryInfo) =>
    `/c/${category.url_path || category.url_key}`;

  if ((!children || children.length === 0) && parentCategories.length === 0) {
    return null;
  }

  return (
    <ScrollArea
      className="lg:max-h-[160px]"
      dynamicHeight
      nativeOnMobile
      variant="arrows"
    >
      <div className="scrollbar-hidden gap-1.25 flex min-w-0 flex-row overflow-x-auto pb-1 lg:flex-wrap lg:overflow-x-hidden">
        {parentCategories.map((parent) => (
          <Link
            className={cn(
              "hover:bg-bg-primary hover:text-text-inverse bg-bg-surface transition-default text-text-primary flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl px-2.5 text-xs font-normal hover:font-semibold lg:h-auto lg:min-h-7 lg:max-w-full lg:flex-wrap lg:justify-start lg:whitespace-normal lg:py-1 lg:text-start"
            )}
            href={getCategoryHref(parent)}
            key={parent.uid}
          >
            <span className="min-w-0 lg:max-w-full lg:break-words">
              {parent.name}
            </span>
            {parent.product_count && (
              <span className="ml-1.5 shrink-0 opacity-75">
                ({parent.product_count})
              </span>
            )}
          </Link>
        ))}

        <div
          aria-current="page"
          className={cn(
            "bg-bg-primary text-text-inverse transition-default flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl px-2.5 text-xs font-semibold lg:h-auto lg:min-h-7 lg:max-w-full lg:flex-wrap lg:justify-start lg:whitespace-normal lg:py-1 lg:text-start"
          )}
        >
          <span className="min-w-0 lg:max-w-full lg:break-words">
            {currentCategory.name}
          </span>
          {currentCategory.product_count && (
            <span className="ml-1.5 shrink-0 opacity-75">
              ({currentCategory.product_count})
            </span>
          )}
        </div>

        {children?.map((child) => (
          <Link
            className={cn(
              "hover:bg-bg-primary hover:text-text-inverse bg-bg-surface transition-default text-text-primary flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl px-2.5 text-xs font-normal hover:font-semibold lg:h-auto lg:min-h-7 lg:max-w-full lg:flex-wrap lg:justify-start lg:whitespace-normal lg:py-1 lg:text-start"
            )}
            href={getCategoryHref(child)}
            key={child.uid}
          >
            <span className="min-w-0 lg:max-w-full lg:break-words">
              {child.name}
            </span>
            {child.product_count && (
              <span className="ml-1.5 shrink-0 opacity-75">
                ({child.product_count})
              </span>
            )}
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
};
