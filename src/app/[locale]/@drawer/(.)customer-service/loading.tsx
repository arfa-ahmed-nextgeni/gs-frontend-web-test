import { CustomerServiceContentSkeleton } from "@/components/shared/customer-service/customer-service-content-skeleton";
import { CustomerServiceOverlay } from "@/components/shared/customer-service/customer-service-overlay";

export default function CustomerServiceLoading() {
  return (
    <CustomerServiceOverlay>
      <CustomerServiceContentSkeleton />
    </CustomerServiceOverlay>
  );
}
