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
    <div className="flex min-h-[115px] items-center justify-between py-7 xl:justify-center xl:gap-4">
      {data.categories.map((category, index) => (
        <div
          className="flex min-w-[91px] flex-col items-center"
          key={category.id}
        >
          {category.imageUrl && (
            <HomeCategoryLink
              imageUrl={category.imageUrl}
              label={category.label}
              lpColumn={index + 1}
              lpRow={lpRow}
              url={category.url}
            />
          )}
        </div>
      ))}
    </div>
  );
}
