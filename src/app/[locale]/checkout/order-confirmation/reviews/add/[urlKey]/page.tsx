import { connection } from "next/server";

import { NavigateBack } from "@/components/navigation/navigate-back";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export default async function AddProductReviewPage() {
  await connection();

  return <NavigateBack />;
}

export function generateStaticParams() {
  return [{ urlKey: ROUTE_PLACEHOLDER }];
}
