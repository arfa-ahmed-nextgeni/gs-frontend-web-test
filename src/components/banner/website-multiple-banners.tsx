import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import {
  WebsiteMultipleBanner,
  WebsiteMultipleBanners,
} from "@/lib/models/website-multiple-banners";
import { cn } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image";

const displayOnClasses: Record<WebsiteMultipleBanners["displayOn"], string> = {
  all: "",
  desktop: "hidden sm:flex",
  mobile: "flex sm:hidden",
};

export default function WebsiteMultipleBannersComponent({
  bannerLpId,
  bannerOrigin,
  bannerRow,
  data,
}: {
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  data: WebsiteMultipleBanners;
}) {
  if (!data || !data.banners || data.banners.length === 0) return null;

  return (
    <div className={cn("flex gap-2.5", displayOnClasses[data.displayOn])}>
      {data.banners.map((banner: WebsiteMultipleBanner, index: number) => (
        <BannerTrackerLink
          bannerColumn={index + 1}
          bannerInnerPosition={index + 1}
          bannerLpId={bannerLpId}
          bannerOrigin={bannerOrigin}
          bannerRow={bannerRow}
          bannerStyle="grid"
          bannerType="banners-in-grid"
          className="relative aspect-[3/2] h-[var(--images-height-mobile)] w-[var(--images-width-mobile)] flex-1 overflow-hidden rounded-2xl lg:h-[var(--images-height)] lg:w-[var(--images-width)]"
          elementId={banner.elementId}
          href={banner.url}
          key={banner.elementId || banner.id}
          style={
            {
              "--images-height": `${data.imagesHeight}px`,
              "--images-height-mobile": `${data.imagesHeightMobile}px`,
              "--images-width": `${data.imagesWidth}px`,
              "--images-width-mobile": `${data.imagesWidthMobile}px`,
            } as React.CSSProperties
          }
        >
          {banner.imageUrl && (
            <ContentfulImage
              alt={banner.label}
              className="absolute size-full object-cover"
              fill
              placeholder={getShimmerPlaceholder()}
              sizes="32vw"
              src={banner.imageUrl}
            />
          )}
        </BannerTrackerLink>
      ))}
    </div>
  );
}
