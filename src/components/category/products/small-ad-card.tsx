import { ComponentProps } from "react";

import Image from "next/image";

import CategoryAd from "@/assets/images/category-ad.png";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export const SmallAdCard = ({
  containerProps,
  imageProps,
}: {
  containerProps?: ComponentProps<typeof Link>;
  imageProps: ComponentProps<typeof Image>;
}) => (
  <Link
    {...containerProps}
    className={cn(
      "h-77.5 relative col-span-1 w-48 max-[400px]:w-full",
      containerProps?.className
    )}
    href={containerProps?.href ?? "/"}
  >
    <Image
      {...imageProps}
      alt={imageProps?.alt ?? "Sponsored Ad"}
      className={cn("object-fit", imageProps?.className)}
      fill
      src={imageProps?.src ?? CategoryAd}
    />
  </Link>
);
