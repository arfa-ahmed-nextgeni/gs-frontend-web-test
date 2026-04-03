import { ProductCardButton } from "@/components/product/product-card/product-card-button";
import { ProductCardWishlistButton } from "@/components/product/product-card/product-card-wishlist-button";

export const ProductCardActions = () => {
  return (
    <div className="transition-default absolute bottom-0 flex w-full translate-y-9 flex-row items-center justify-between px-5 group-focus-within:-translate-y-3 group-hover:-translate-y-3 group-has-[button[data-loading=true]]:-translate-y-3">
      <ProductCardButton />
      <ProductCardWishlistButton />
    </div>
  );
};
