import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { LocalizedPrice } from "@/components/shared/localized-price";
import usePrice from "@/hooks/product/use-price";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

type SearchProductProps = {
  product: any;
};

const SearchCard: React.FC<SearchProductProps> = ({ product }) => {
  const { description, image, name, product_type } = product ?? {};
  const { basePrice, price } = usePrice({
    amount: product?.sale_price ? product?.sale_price : product?.price,
    baseAmount: product?.price,
    currencyCode: "SAR",
  });
  const { price: minPrice } = usePrice({
    amount: product?.min_price ?? 0,
    currencyCode: "SAR",
  });
  const { price: maxPrice } = usePrice({
    amount: product?.max_price ?? 0,
    currencyCode: "SAR",
  });

  return (
    <Link
      className="group flex h-auto w-36 flex-col items-center justify-start rounded-xl px-2.5 pb-2.5"
      href={ROUTES.PRODUCT.BY_URL_KEY(product?.urlKey)}
    >
      <div className="size-30 relative overflow-hidden rounded-xl">
        <ProductImageWithFallback
          alt={name || "Product Image"}
          className="size-full object-cover"
          height={100}
          src={image?.thumbnail}
          width={100}
        />
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <div>
          <div className="text-text-primary line-clamp-1 text-[9px] font-semibold">
            {name}
          </div>
          <div className="text-text-primary line-clamp-2 text-[9px] font-normal">
            {description}
          </div>
        </div>
        <div className="text-text-danger text-xs font-semibold">
          <LocalizedPrice
            price={
              product_type === "variable" ? `${minPrice || maxPrice}` : price
            }
          />
          {basePrice && (
            <span className="font-gilroy text-text-secondary ms-2.5 text-[9px] font-normal line-through">
              <LocalizedPrice price={basePrice} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SearchCard;
