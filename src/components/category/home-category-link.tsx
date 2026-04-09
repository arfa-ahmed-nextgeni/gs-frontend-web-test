import { ContentfulImage } from "@/components/shared/contentful-image";
import { Link } from "@/i18n/navigation";
import { HOME_CATEGORY_CLICK_ORIGIN_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";
import { cn } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image";

import { serializeHomeCategoryClickOrigin } from "./utils/home-category-click-origin-dataset";

interface HomeCategoryLinkProps {
  className?: string;
  imageUrl: string;
  label: string;
  lpColumn?: number;
  lpRow?: number;
  url: string;
}

export function HomeCategoryLink({
  className,
  imageUrl,
  label,
  lpColumn,
  lpRow,
  url,
}: HomeCategoryLinkProps) {
  const serializedClickOrigin = serializeHomeCategoryClickOrigin({
    lpColumn,
    lpRow,
  });

  return (
    <Link
      className={cn("flex w-full flex-col items-center", className)}
      href={url}
      {...(serializedClickOrigin
        ? {
            [HOME_CATEGORY_CLICK_ORIGIN_DATA_ATTRIBUTE]: serializedClickOrigin,
          }
        : {})}
    >
      <div className="size-22.75 flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black">
        <ContentfulImage
          alt=""
          aria-hidden="true"
          className="size-22.75 object-contain"
          height={91}
          placeholder={getShimmerPlaceholder()}
          sizes="91px"
          src={imageUrl}
          width={91}
        />
      </div>
      <span className="wrap-break-word text-text-primary mt-2 max-w-full text-center text-xs">
        {label}
      </span>
    </Link>
  );
}
