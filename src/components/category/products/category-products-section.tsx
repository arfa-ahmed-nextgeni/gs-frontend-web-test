import { getLocale } from "next-intl/server";

import { CategoryProductsClientWrapper } from "@/components/category/products/category-products-client-wrapper";
import { CategoryProductsDesktop } from "@/components/category/products/category-products-desktop";
import { CategoryProductsSuggestion } from "@/components/category/products/category-products-suggestion";
import { getBulletDeliveryEnabled } from "@/lib/actions/config/get-bullet-delivery-enabled";
import { type Locale } from "@/lib/constants/i18n";
import { type ProductCardModel } from "@/lib/models/product-card-model";

interface CategoryMetadata {
  name: string;
  uid: string;
  urlPath?: string;
}

interface CategoryProductsSectionProps {
  categoryId?: number;
  categoryMetadata?: CategoryMetadata;
  categoryPath: string;
  categoryUid: string;
  currentPage: number;
  products: ProductCardModel[];
  searchTerm?: string;
  totalCount: number;
  totalPages: number;
}

export async function CategoryProductsSection({
  categoryId,
  categoryMetadata,
  categoryPath,
  categoryUid,
  currentPage,
  products,
  searchTerm,
  totalCount,
  totalPages,
}: CategoryProductsSectionProps) {
  const locale = (await getLocale()) as Locale;
  const isBulletDeliveryEnabled = await getBulletDeliveryEnabled({ locale });
  const serializedProducts = structuredClone(products);

  return (
    <section className="flex flex-col gap-9">
      <div className="hidden lg:block">
        <CategoryProductsDesktop
          categoryId={categoryId}
          isBulletDeliveryEnabled={isBulletDeliveryEnabled}
          products={serializedProducts}
          searchTerm={searchTerm}
          totalPages={totalPages}
        />
      </div>

      <CategoryProductsClientWrapper
        categoryMetadata={categoryMetadata}
        categoryPath={categoryPath}
        categoryUid={categoryUid}
        currentPage={currentPage}
        isBulletDeliveryEnabled={isBulletDeliveryEnabled}
        locale={locale}
        products={serializedProducts}
        searchTerm={searchTerm}
        totalCount={totalCount}
        totalPages={totalPages}
      />

      <CategoryProductsSuggestion />
    </section>
  );
}
