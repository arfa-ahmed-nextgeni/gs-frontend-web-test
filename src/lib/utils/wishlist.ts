import type { Wishlist, WishlistItem } from "@/lib/models/wishlist";

export function findMatchingWishlistItem({
  product,
  selectedProduct,
  wishlist,
}: {
  product: {
    isConfigurable?: boolean;
    sku: string;
  };
  selectedProduct: {
    id?: string;
    sku: string;
  };
  wishlist?: null | Wishlist;
}) {
  return wishlist?.items.find((item) =>
    isMatchingWishlistItem({
      item,
      product,
      selectedProduct,
    })
  );
}

export function isMatchingWishlistItem({
  item,
  product,
  selectedProduct,
}: {
  item: WishlistItem;
  product: {
    isConfigurable?: boolean;
    sku: string;
  };
  selectedProduct: {
    id?: string;
    sku: string;
  };
}) {
  if (!product.isConfigurable) {
    return item.sku === product.sku;
  }

  const selectedOptionId =
    selectedProduct.id != null ? String(selectedProduct.id) : undefined;
  const matchesParentSku = item.skuParent === product.sku;
  const matchesSelectedOption = !!selectedOptionId
    ? item.options?.choices.some((choice) => choice.value === selectedOptionId)
    : false;
  const matchesVariantSku =
    item.sku === selectedProduct.sku || item.childSku === selectedProduct.sku;

  return matchesParentSku && (matchesSelectedOption || matchesVariantSku);
}
