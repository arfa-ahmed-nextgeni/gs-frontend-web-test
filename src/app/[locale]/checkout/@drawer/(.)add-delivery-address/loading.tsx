import { Skeleton } from "@/components/ui/skeleton";

export default function AddDeliveryAddressLoading() {
  return (
    <div className="h-screen w-full">
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
}
