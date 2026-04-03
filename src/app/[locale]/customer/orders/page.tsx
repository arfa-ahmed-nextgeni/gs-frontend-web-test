import { unauthorized } from "next/navigation";

import { CustomerOrdersPage } from "@/components/customer/orders";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

export default async function CustomerOrdersRoute() {
  const currentCustomer = await getCurrentCustomer();

  if (isUnauthenticated(currentCustomer)) {
    unauthorized();
  }

  if (isError(currentCustomer)) {
    throw new Error(currentCustomer.error);
  }

  return <CustomerOrdersPage />;
}
