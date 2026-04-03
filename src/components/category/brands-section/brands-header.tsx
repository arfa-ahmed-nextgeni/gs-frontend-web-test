import { Suspense } from "react";

import { useTranslations } from "next-intl";

import { BrandCategoryLink } from "@/components/category/brands-section/brand-category-link";
import Container from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";
import { NavigationItem } from "@/lib/models/site-navigation";

export const BrandsHeader = ({
  brandsCategories,
}: {
  brandsCategories?: NavigationItem[];
}) => {
  const t = useTranslations("BrandsCategoryPage");

  return (
    <>
      <Container className="mt-5 hidden lg:block">
        <p className="text-text-primary text-2xl font-normal">{t("title")}</p>
      </Container>
      <Container className="scrollbar-hidden mt-5 flex flex-row justify-start gap-2.5 overflow-x-auto lg:mt-2.5 lg:flex-wrap lg:justify-center">
        {brandsCategories?.map((brandCategory) => (
          <Suspense
            fallback={<Skeleton className="w-18.5 h-7" />}
            key={brandCategory.id}
          >
            <BrandCategoryLink {...brandCategory} />
          </Suspense>
        ))}
      </Container>
    </>
  );
};
