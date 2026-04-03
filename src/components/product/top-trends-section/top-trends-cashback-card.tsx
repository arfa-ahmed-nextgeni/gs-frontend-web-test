import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";

import { TopTrendsBannerImage } from "@/components/product/top-trends-section/top-trends-banner-image";
import { TopTrendsSignupButton } from "@/components/product/top-trends-section/top-trends-signup-button";
import { ROUTES } from "@/lib/constants/routes";
import { TopTrendsCategoryProducts } from "@/lib/models/top-trends-category-products";

export const TopTrendsCashbackCard = ({
  buttonClassName = "",
  buttonText,
  cashbackCurrencyImageUrl,
  cashbackTitle,
  currencyClassName = "",
  navigateTo,
}: {
  buttonClassName?: string;
  buttonText: TopTrendsCategoryProducts["cashbackButtonTitle"];
  cashbackCurrencyImageUrl?: string;
  cashbackTitle: TopTrendsCategoryProducts["cashbackTitle"];
  currencyClassName?: string;
  navigateTo?: string;
}) => (
  <>
    <div className="text-text-primary text-2xl font-normal sm:text-3xl">
      {cashbackTitle
        ? documentToReactComponents(cashbackTitle, {
            renderMark: {
              [MARKS.BOLD]: (text: React.ReactNode) => (
                <span className="font-semibold">{text}</span>
              ),
            },
            renderNode: {
              // SEO: Convert h1 to h2 to ensure only one h1 per page
              [BLOCKS.HEADING_1]: (_node, children) => (
                <h2 className="inline">{children}</h2>
              ),
            },
          })
        : ""}
    </div>
    {navigateTo?.includes(ROUTES.CUSTOMER.LOGIN) && (
      <TopTrendsSignupButton
        className={buttonClassName}
        title={buttonText ?? ""}
      />
    )}
    <TopTrendsBannerImage
      className={currencyClassName}
      imageProps={{
        alt: "Top Trends Currency",
        className: "size-full object-contain",
        fill: true,
        sizes: "12.5vw",
        src: cashbackCurrencyImageUrl,
      }}
    />
  </>
);
