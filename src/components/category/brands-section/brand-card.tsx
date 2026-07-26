import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { Link } from "@/i18n/navigation";
import { Brand } from "@/lib/types/brands";

export const BrandCard = ({ brand }: { brand: Brand }) => (
  <Link
    className="max-w-30.5 lg:max-w-35.25 lg:w-35.25 group flex w-[27vw] flex-col gap-2.5"
    href={brand.urlPath || `/${brand.urlKey}`}
  >
    <div className="bg-bg-default h-26 lg:h-30 relative w-full overflow-hidden rounded-xl">
      <ProductImageWithFallback
        alt={brand.name || "brand logo"}
        className="scale-120 hover:scale-130 size-full object-contain p-1"
        fill
        sizes="(max-width: 1023px) 27vw, 141px"
        src={brand.image}
      />
    </div>
    <p className="lg:text-text-placeholder transition-default text-text-secondary lg:group-hover:text-text-secondary line-clamp-2 text-center text-[10px] font-normal lg:text-xs">
      {brand.name}
    </p>
  </Link>
);
