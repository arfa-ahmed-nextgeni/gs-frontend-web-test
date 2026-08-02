import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import {
  WebsiteMultipleBanner,
  WebsiteMultipleBanners,
} from "@/lib/models/website-multiple-banners";
import { cn } from "@/lib/utils";
import { getDisplayOnClassName } from "@/lib/utils/display-on";
import { getShimmerPlaceholder } from "@/lib/utils/image";

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

  const imageSizes = data.imagesWidth
    ? `(min-width: 1200px) ${data.imagesWidth}px, 32vw`
    : "32vw";

  return (
    <div
      className={cn(
        "flex gap-2.5",
        getDisplayOnClassName(data.displayOn, "flex")
      )}
    >
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
              sizes={imageSizes}
              src={banner.imageUrl}
            />
          )}
        </BannerTrackerLink>
      ))}
    </div>
  );
}
