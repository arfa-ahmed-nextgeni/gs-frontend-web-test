import { AddPickupPointMap } from "@/components/checkout/add-pickup-point/add-pickup-point-map";
import { AddPickupPointSteps } from "@/components/checkout/add-pickup-point/add-pickup-point-steps";

export const AddPickupPointView = () => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AddPickupPointMap />
      <AddPickupPointSteps />
    </div>
  );
};
