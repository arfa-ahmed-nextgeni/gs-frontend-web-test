import CurrentLocationIcon from "@/assets/icons/current-location-icon.svg";
import MinusIcon from "@/assets/icons/minus-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";

import { AddPickupPointMapControlButton } from "./add-pickup-point-map-control-button";

export const AddPickupPointMapControls = ({
  onLocate,
  onZoomIn,
  onZoomOut,
}: {
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) => {
  return (
    <div className="gap-1.25 absolute bottom-5 end-5 z-10 flex flex-col">
      <AddPickupPointMapControlButton
        alt="Locate"
        ariaLabel="Locate current position"
        icon={CurrentLocationIcon}
        onClick={onLocate}
      />
      <AddPickupPointMapControlButton
        alt="Zoom in"
        ariaLabel="Zoom in"
        icon={PlusIcon}
        onClick={onZoomIn}
      />
      <AddPickupPointMapControlButton
        alt="Zoom out"
        ariaLabel="Zoom out"
        icon={MinusIcon}
        onClick={onZoomOut}
      />
    </div>
  );
};
