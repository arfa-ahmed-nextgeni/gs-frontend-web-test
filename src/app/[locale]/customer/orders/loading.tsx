import { CustomerOrdersSkeleton } from "@/components/customer/orders/customer-orders-skeleton";

export default function Loading() {
  return (
    <div className="px-2.5 lg:mt-2 lg:px-0">
      <CustomerOrdersSkeleton />
    </div>
  );
}
