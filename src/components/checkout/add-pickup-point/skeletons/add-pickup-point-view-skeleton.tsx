import { AddPickupPointMapSkeleton } from "@/components/checkout/add-pickup-point/skeletons/add-pickup-point-map-skeleton";
import { AddPickupPointStepsSkeleton } from "@/components/checkout/add-pickup-point/skeletons/add-pickup-point-steps-skeleton";

export const AddPickupPointViewSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AddPickupPointMapSkeleton />
      <AddPickupPointStepsSkeleton />
    </div>
  );
};
