import { connection } from "next/server";

import { RedirectToCustomerOrders } from "@/components/navigation/redirect-to-customer-orders";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export function generateStaticParams() {
  return [{ id: ROUTE_PLACEHOLDER }];
}

export default async function ViewOrderePage() {
  await connection();

  return <RedirectToCustomerOrders />;
}
