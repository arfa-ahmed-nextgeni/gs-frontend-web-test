import { TopTrendsBannerImage } from "@/components/product/top-trends-section/top-trends-banner-image";
import { ResponsiveImage } from "@/lib/models/responsive-image";

export const TopTrendsBannerSlot = ({
  alt,
  banner,
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  className,
  device,
  sizes,
}: {
  alt: string;
  banner?: ResponsiveImage;
  bannerColumn?: number;
  bannerInnerPosition: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  className: string;
  device: "desktop" | "mobile";
  sizes: string;
}) => (
  <TopTrendsBannerImage
    bannerColumn={bannerColumn}
    bannerInnerPosition={bannerInnerPosition}
    bannerLpId={bannerLpId}
    bannerOrigin={bannerOrigin}
    bannerRow={bannerRow}
    bannerStyle="grid"
    bannerType="banners-in-grid"
    className={className}
    elementId={banner?.elementId}
    imageProps={{
      alt,
      fill: true,
      sizes,
      src: device === "mobile" ? banner?.mobile.url : banner?.desktop.url,
    }}
    redirectUrl={banner?.redirectUrl}
  />
);
