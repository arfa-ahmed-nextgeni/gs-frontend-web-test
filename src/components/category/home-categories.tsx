import { HomeCategoriesScrollContainer } from "@/components/category/home-categories-scroll-container";
import { HomeCategoryLink } from "@/components/category/home-category-link";
import { DesktopCategories } from "@/lib/models/desktop-categories";

interface HomeCategoriesProps {
  data: DesktopCategories;
  lpRow?: number;
}

export default function HomeCategories({ data, lpRow }: HomeCategoriesProps) {
  if (!data || !data.categories || data.categories.length === 0) {
    return null;
  }
  return (
    <HomeCategoriesScrollContainer className="scrollbar-hidden min-h-28.75 w-full min-w-0 overflow-x-auto py-7">
      <div className="flex w-max min-w-full items-start justify-between gap-5 xl:justify-center">
        {data.categories.map((category, index) =>
          category.imageUrl ? (
            <HomeCategoryLink
              className="w-22.75 shrink-0"
              imageUrl={category.imageUrl}
              key={category.id}
              label={category.label}
              lpColumn={index + 1}
              lpRow={lpRow}
              url={category.url}
            />
          ) : null
        )}
      </div>
    </HomeCategoriesScrollContainer>
  );
}
