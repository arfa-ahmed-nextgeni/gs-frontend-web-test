import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { cn } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image";

export const TopTrendsBannerImage = ({
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  bannerStyle,
  bannerType,
  className,
  elementId,
  imageProps,
  redirectUrl,
}: {
  bannerColumn?: number;
  bannerInnerPosition?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  bannerStyle?: "grid" | "horizontal" | "list" | "paged";
  bannerType?: "banner-slider" | "banner" | "banners-in-grid";
  className?: string;
  elementId?: string;
  imageProps: {
    alt: string;
    className?: string;
    fill?: boolean;
    sizes?: string;
    src?: string;
  };
  redirectUrl?: string;
}) => {
  if (!imageProps.src) return <div className={className}></div>;

  const renderImage = () => (
    <ContentfulImage
      {...imageProps}
      alt={imageProps.alt}
      className={cn("absolute size-full object-cover", imageProps.className)}
      placeholder={getShimmerPlaceholder()}
      src={imageProps.src || ""}
    />
  );

  if (redirectUrl) {
    return (
      <BannerTrackerLink
        bannerColumn={bannerColumn}
        bannerInnerPosition={bannerInnerPosition}
        bannerLpId={bannerLpId}
        bannerOrigin={bannerOrigin}
        bannerRow={bannerRow}
        bannerStyle={bannerStyle}
        bannerType={bannerType}
        className={className}
        elementId={elementId}
        href={redirectUrl}
      >
        {renderImage()}
      </BannerTrackerLink>
    );
  }

  return <div className={className}>{renderImage()}</div>;
};
