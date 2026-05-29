import { getTranslations } from "next-intl/server";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import type {
  Category,
  CategoryBreadcrumb,
} from "@/lib/types/category-route-data";

interface CategoryChip {
  href: string;
  name: string;
  uid: string;
}

interface CategoryTypeFilterProps {
  breadcrumbs: CategoryBreadcrumb[];
  category: Category;
}

const CHIP_BASE_CLASSES =
  "hover:bg-bg-primary hover:text-text-inverse bg-bg-surface transition-default text-text-primary flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl px-2.5 text-xs font-normal hover:font-semibold lg:h-auto lg:min-h-7 lg:max-w-full lg:flex-wrap lg:justify-start lg:whitespace-normal lg:py-1 lg:text-start";

const CURRENT_CHIP_CLASSES =
  "bg-bg-primary text-text-inverse transition-default flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl px-2.5 text-xs font-semibold lg:h-auto lg:min-h-7 lg:max-w-full lg:flex-wrap lg:justify-start lg:whitespace-normal lg:py-1 lg:text-start";

export async function CategoryTypeFilter({
  breadcrumbs,
  category,
}: CategoryTypeFilterProps) {
  const t = await getTranslations("category");
  const parentChips = deriveParentChips(breadcrumbs, t("previous"));
  const childChips =
    category.children?.map<CategoryChip>((child) => ({
      href: `/c/${child.url_path || child.url_key}`,
      name: child.name,
      uid: child.uid,
    })) ?? [];

  if (childChips.length === 0 && parentChips.length === 0) {
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
        {parentChips.map((parent) => (
          <Link
            className={cn(CHIP_BASE_CLASSES)}
            href={parent.href}
            key={parent.uid}
          >
            <span className="min-w-0 lg:max-w-full lg:break-words">
              {parent.name}
            </span>
          </Link>
        ))}

        <div aria-current="page" className={cn(CURRENT_CHIP_CLASSES)}>
          <span className="min-w-0 lg:max-w-full lg:break-words">
            {category.name}
          </span>
        </div>

        {childChips.map((child) => (
          <Link
            className={cn(CHIP_BASE_CLASSES)}
            href={child.href}
            key={child.uid}
          >
            <span className="min-w-0 lg:max-w-full lg:break-words">
              {child.name}
            </span>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}

function deriveParentChips(
  breadcrumbs: CategoryBreadcrumb[],
  previousLabel: string
): CategoryChip[] {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.length <= 2) {
    return [];
  }

  const parentHref = breadcrumbs.at(-2)?.href || "";
  const parentPath = parentHref.replace(/^\/c\//, "").replace(/^\/+|\/+$/g, "");

  if (!parentPath) {
    return [];
  }

  return [
    {
      href: `/c/${parentPath}`,
      name: previousLabel,
      uid: `parent-${parentPath}`,
    },
  ];
}
