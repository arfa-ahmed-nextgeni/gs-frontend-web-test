import { DesktopBreadcrumb } from "@/components/shared/breadcrumb/desktop-breadcrumb";
import { ProductType } from "@/lib/constants/product/product-details";
import { ROUTES } from "@/lib/constants/routes";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

export const ProductBreadcrumb = ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  return (
    <DesktopBreadcrumb
      items={
        product.type === ProductType.Beauty
          ? [
              { href: ROUTES.ROOT },
              {
                href: ROUTES.CATEGORY.BY_SLUG("new"),
                title: product.brand,
              },
            ]
          : [ProductType.EGiftCard, ProductType.GiftCard].includes(product.type)
            ? [
                { href: ROUTES.ROOT },
                { href: ROUTES.CATEGORY.BY_SLUG("new"), title: product.brand },
              ]
            : [
                { href: ROUTES.ROOT },
                {
                  href: ROUTES.CATEGORY.BY_SLUG("new"),
                  title: product.brand,
                },
              ]
      }
      routeTitle={product.name}
    />
  );
};
