import { AddPickupPointLocationSelectionSkeleton } from "@/components/checkout/add-pickup-point/skeletons/add-pickup-point-location-selection-skeleton";

export const AddPickupPointStepsSkeleton = () => {
  return (
    <div className="bg-bg-body scrollbar-hidden min-h-1/2 flex flex-1 flex-col gap-2.5 overflow-y-auto p-5">
      <AddPickupPointLocationSelectionSkeleton />
    </div>
  );
};
