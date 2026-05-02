import { ROUTES } from "@/lib/constants/routes";

export const getProductDetailsHref = ({
  sku,
  urlKey,
}: {
  sku?: null | string;
  urlKey?: null | string;
}) => {
  const productPath = urlKey?.trim() || sku?.trim();

  return productPath ? ROUTES.PRODUCT.BY_URL_KEY(productPath) : undefined;
};
