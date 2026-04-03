import type { CSSProperties } from "react";

import Container from "@/components/shared/container";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { Link } from "@/i18n/navigation";
import { WebsiteFooterPromoAndFeatures } from "@/lib/models/website-footer";

export const FooterPromotion = ({
  promoBar,
}: {
  promoBar: WebsiteFooterPromoAndFeatures["promoBar"];
}) => {
  return (
    <Container className="mb-5 grid grid-cols-1 lg:grid-cols-2">
      <div className="my-auto text-center text-base lg:text-start lg:text-xl">
        <span className="text-text-primary font-normal">
          {promoBar.paymentPlanText}
        </span>
        {promoBar.cta && (
          <Link
            className="text-text-brand ml-2 font-semibold"
            href={promoBar.cta.url}
          >
            {promoBar.cta.label}
          </Link>
        )}
      </div>
      <div className="scrollbar-hidden flex w-full flex-row gap-2.5 overflow-x-auto pt-5 lg:justify-end lg:overflow-x-visible lg:pt-0">
        {promoBar.features.map((feature, index) => {
          const iconWidth =
            typeof feature.iconStyles?.width === "number"
              ? feature.iconStyles.width
              : 30;
          const iconHeight =
            typeof feature.iconStyles?.height === "number"
              ? feature.iconStyles.height
              : 30;
          const iconStyle: CSSProperties = feature.iconStyles ?? {};

          return (
            <div
              className="h-7.5 bg-bg-default flex flex-shrink-0 items-center gap-2 rounded-sm pe-2.5"
              key={index}
            >
              <span className="flex flex-row items-center gap-2">
                {feature.iconUrl && (
                  <ContentfulImage
                    alt={feature.highlight}
                    className="h-7.5"
                    height={iconHeight}
                    src={feature.iconUrl.replace(/^\/\//, "https://")}
                    style={iconStyle}
                    width={iconWidth}
                  />
                )}
                <span className="text-text-primary whitespace-pre-wrap rtl:flex-row-reverse">
                  {feature.text}{" "}
                  <span className="text-text-brand font-semibold">
                    {feature.highlight}
                  </span>{" "}
                  <span className="text-text-primary">{feature.suffix}</span>
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </Container>
  );
};
