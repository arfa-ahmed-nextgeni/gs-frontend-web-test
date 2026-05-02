import Image from "next/image";

import { getTranslations } from "next-intl/server";

import AddIcon from "@/assets/icons/add-icon.svg";
import { SectionHeader } from "@/components/common/section-header";
import { ProductReviewCard } from "@/components/product/product-reviews/product-review-card";
import { ProductReviewWriteLink } from "@/components/product/product-reviews/product-review-write-link";
import Container from "@/components/shared/container";
import { CardRailScrollSnapCarousel } from "@/components/ui/card-rail-scroll-snap-carousel";
import { ScrollSnapCarouselItem } from "@/components/ui/scroll-snap-carousel";
import { getProductReviews } from "@/lib/actions/products/get-product-reviews";
import { ProductType } from "@/lib/constants/product/product-details";
import { ROUTES } from "@/lib/constants/routes";
import { ProductDetailsModel } from "@/lib/models/product-details-model";
import { cn } from "@/lib/utils";
import { isError } from "@/lib/utils/service-result";

export const ProductReviewsCarousel = async ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  const productReviewsResponse = await getProductReviews({
    page: 1,
    pageSize: 10,
    productId: product.id,
  });

  const noReviewsAvailable =
    isError(productReviewsResponse) ||
    !productReviewsResponse.data.reviews.length;

  const t = await getTranslations("ProductPage.reviewsSection");

  return (
    <Container
      className={cn("mb-7.5 !px-0", {
        "mt-5 lg:mt-10": product.type === ProductType.GiftCard,
      })}
    >
      <div className="gap-4.5 flex flex-col">
        <SectionHeader
          className="px-2.5 lg:px-0"
          sectionHeading={
            <p className="text-text-primary text-2xl font-normal rtl:font-semibold">
              {t.rich("title", {
                b: (chunks) => (
                  <span className="font-semibold rtl:font-bold">{chunks}</span>
                ),
              })}
            </p>
          }
          seeAllButton={{
            href: ROUTES.PRODUCT.REVIEWS(product.urlKey, product.id),
            mobileScroll: true,
            scroll: false,
            show: noReviewsAvailable ? false : true,
            text: t("seeAll"),
          }}
        />
        {noReviewsAvailable ? (
          <div className="flex w-full items-center justify-center">
            <p className="text-text-primary text-sm font-medium">
              {t("noReviews")}
            </p>
          </div>
        ) : (
          <CardRailScrollSnapCarousel
            contentProps={{
              className: "px-2.5 lg:!px-0",
            }}
            nextButtonProps={{
              className: "xl:translate-x-15 xl:rtl:-translate-x-15",
            }}
            nextIconProps={{
              fill: "#374957",
            }}
            previousButtonProps={{
              className: "xl:-translate-x-15 xl:rtl:translate-x-15",
            }}
            previousIconProps={{
              fill: "#374957",
            }}
          >
            {productReviewsResponse.data.reviews.map((review) => (
              <ScrollSnapCarouselItem key={`review-${review.id}`}>
                <ProductReviewCard
                  author={review.author}
                  date={review.date}
                  message={review.message}
                  productId={product.id}
                  rating={review.rating}
                  reviewId={review.id}
                />
              </ScrollSnapCarouselItem>
            ))}
          </CardRailScrollSnapCarousel>
        )}
        <ProductReviewWriteLink
          loadingLinkProps={{
            className: cn(
              "text-text-ghost flex flex-row items-center gap-0.5 text-xs font-bold",
              "transition-default h-8.75 bg-btn-bg-primary self-end-safe me-2.5 flex items-center justify-center rounded-xl px-5",
              "hover:bg-btn-bg-slate",
              "focus:bg-btn-bg-primary focus:outline-none"
            ),
          }}
        >
          <Image alt="" className="size-2" height={8} src={AddIcon} width={8} />{" "}
          {t("writeAReview")}
        </ProductReviewWriteLink>
      </div>
    </Container>
  );
};
