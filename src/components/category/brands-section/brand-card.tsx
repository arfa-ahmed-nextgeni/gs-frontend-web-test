import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { Brand } from "@/lib/types/brands";

export const BrandCard = ({
  brand,
  isFirstLetterGroup,
}: {
  brand: Brand;
  isFirstLetterGroup: boolean;
}) => (
  <Link
    className="max-w-30.5 lg:max-w-35.25 lg:w-35.25 group flex w-[27vw] flex-col gap-2.5"
    href={brand.urlPath || `/${brand.urlKey}`}
    prefetch={false}
  >
    <div className="bg-bg-default h-26 lg:h-30 relative w-full overflow-hidden rounded-xl">
      {brand.image && (
        <Image
          alt={brand.name || "brand logo"}
          className="transition-default size-full object-contain p-3.5 lg:p-5 lg:group-hover:p-3.5"
          decoding={isFirstLetterGroup ? "sync" : "async"}
          fetchPriority={isFirstLetterGroup ? "high" : undefined}
          fill
          loading={isFirstLetterGroup ? "eager" : "lazy"}
          priority={isFirstLetterGroup}
          sizes="(max-width: 1023px) 27vw, 141px"
          src={brand.image}
        />
      )}
    </div>
    <p className="lg:text-text-placeholder transition-default text-text-secondary lg:group-hover:text-text-secondary line-clamp-2 text-center text-[10px] font-normal lg:text-xs">
      {brand.name}
    </p>
  </Link>
);
