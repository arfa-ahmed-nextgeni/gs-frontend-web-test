import { AddPickupPointDrawerLayout } from "@/components/checkout/add-pickup-point/add-pickup-point-drawer-layout";
import { AddPickupPointView } from "@/components/checkout/add-pickup-point/add-pickup-point-view";
import { ManualGeolocationTrigger } from "@/components/checkout/add-pickup-point/manual-geolocation-trigger";

export const AddPickupPointContainer = () => {
  return (
    <AddPickupPointDrawerLayout>
      <AddPickupPointView />
      <ManualGeolocationTrigger />
    </AddPickupPointDrawerLayout>
  );
};
