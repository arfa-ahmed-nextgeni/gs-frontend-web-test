import { notFound } from "next/navigation";

import { ViewOrderResponsiveView } from "@/components/customer/orders/view-order/view-order-responsive-view";
import { ViewOrderContextProvider } from "@/contexts/view-order-context";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export function generateStaticParams() {
  return [{ id: ROUTE_PLACEHOLDER }];
}

export default async function ViewOrderDrawerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === ROUTE_PLACEHOLDER) {
    notFound();
  }

  return (
    <ViewOrderContextProvider>
      <ViewOrderResponsiveView orderId={params} />
    </ViewOrderContextProvider>
  );
}
