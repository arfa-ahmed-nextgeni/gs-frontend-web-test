import { AsyncBoundary } from "@/components/common/async-boundary";
import { TopTrendsContent } from "@/components/product/top-trends-section/top-trends-content";
import { TopTrendsContentSkeleton } from "@/components/product/top-trends-section/top-trends-content-skeleton";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";

export const TopTrendsSection = (
  props: {
    bannerColumn?: number;
    bannerLpId?: string;
    bannerOrigin?: "lp" | "pdp" | "plp";
    bannerRow?: number;
    delayMs?: number;
    lpRow?: number;
  } & TopTrendsCategoryProducts
) => {
  return (
    <AsyncBoundary
      loadingFallback={<TopTrendsContentSkeleton variant={props.variant} />}
    >
      <TopTrendsContent
        bannerColumn={props.bannerColumn}
        bannerLpId={props.bannerLpId}
        bannerOrigin={props.bannerOrigin}
        bannerRow={props.bannerRow}
        delayMs={props.delayMs}
        lpRow={props.lpRow}
        {...props}
      />
    </AsyncBoundary>
  );
};
