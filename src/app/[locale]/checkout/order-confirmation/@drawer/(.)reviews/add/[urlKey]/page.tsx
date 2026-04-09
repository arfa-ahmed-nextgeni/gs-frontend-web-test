import { AddProductReviewPageContent } from "@/components/product/product-reviews/product-review-form/add-product-review-page-content";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export default async function AddProductReviewPage({
  params,
}: PageProps<"/[locale]/checkout/order-confirmation/reviews/add/[urlKey]">) {
  return <AddProductReviewPageContent params={params} />;
}

export function generateStaticParams() {
  return [{ urlKey: ROUTE_PLACEHOLDER }];
}
