import { WishlistTracker } from "@/components/analytics/wishlist-tracker";
import { WishlistProductsSection } from "@/components/wishlist/wishlist-products-section";

export default function CustomerWishlistPage() {
  return (
    <>
      <WishlistTracker />
      <WishlistProductsSection />
    </>
  );
}
