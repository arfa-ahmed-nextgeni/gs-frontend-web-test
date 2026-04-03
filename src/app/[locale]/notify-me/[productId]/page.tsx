import { connection } from "next/server";

import { NavigateBack } from "@/components/navigation/navigate-back";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export function generateStaticParams() {
  return [{ productId: ROUTE_PLACEHOLDER }];
}

export default async function NotifyMePage() {
  await connection();

  return <NavigateBack />;
}
