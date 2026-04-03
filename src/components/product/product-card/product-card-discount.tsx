import { ProductCardLabel } from "@/components/product/product-card/product-card-label";

export const ProductCardDiscount = ({ discount }: { discount: number }) => {
  return (
    <ProductCardLabel
      className="w-11.75 bg-label-accent-light group-focus-within:bg-label-accent-medium group-hover:bg-label-accent-medium group-has-[button[data-loading=true]]:bg-label-accent-medium"
      dir="ltr"
    >
      {discount > 0 ? `-${discount}%` : `${discount}%`}
    </ProductCardLabel>
  );
};
