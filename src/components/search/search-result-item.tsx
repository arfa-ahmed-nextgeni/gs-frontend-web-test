import Image from "next/image";

import { searchProductPlaceholder } from "@/assets/placeholders";
import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { Link } from "@/i18n/navigation";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { ROUTES } from "@/lib/constants/routes";
import { type ProductCardModel } from "@/lib/models/product-card-model";

interface SearchResultItemProps {
  onClick?: () => void;
  position?: number;
  product: ProductCardModel;
  searchTerm?: string;
}

const SearchResultItem = ({
  onClick,
  position,
  product,
  searchTerm,
}: SearchResultItemProps) => {
  const brand = product.brand || product.name || "";
  const productName = product.description || product.name || "";

  const handleClick = () => {
    if (searchTerm && position !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        origin: "search",
        position,
        term: searchTerm,
      });
    }

    onClick?.();
  };

  return (
    <Link
      className="block"
      href={ROUTES.PRODUCT.BY_URL_KEY(product.urlKey || "")}
      onClick={handleClick}
      title={productName || "View product"}
    >
      <div className="flex items-center gap-1.5 px-2 py-1">
        <div className="h-9 w-9 flex-shrink-0">
          <Image
            alt={productName || "Product Image"}
            className="h-full w-full rounded-lg object-cover"
            height={64}
            src={product.imageUrl || searchProductPlaceholder}
            width={64}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold text-gray-900">{brand}</div>
          <div className="line-clamp-2 text-xs font-normal text-gray-500">
            {productName}
          </div>
        </div>

        <ProductCardPrice
          countdownTimer={product.countdownTimer}
          countdownTimerIconProps={{
            className: "size-3",
          }}
          oldPrice={product.oldPrice}
          oldPriceClassName="text-[9px] ms-1.25"
          price={product.currentPrice}
          priceClassName="text-xs"
        />
      </div>
    </Link>
  );
};

export default SearchResultItem;
