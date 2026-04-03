"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { useAddPickupPointContext } from "@/contexts/add-pickup-point-context";

export const ManualGeolocationInput = ({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const t = useTranslations("AddPickupPointPage.manualGeolocation");
  const { manualLocation, setManualLocation } = useAddPickupPointContext();

  const [latitude, setLatitude] = useState(
    manualLocation?.lat.toString() || ""
  );
  const [longitude, setLongitude] = useState(
    manualLocation?.lng.toString() || ""
  );
  const [error, setError] = useState<null | string>(null);

  // Sync state when dialog opens or manualLocation changes
  useEffect(() => {
    if (open) {
      setLatitude(manualLocation?.lat.toString() || "");
      setLongitude(manualLocation?.lng.toString() || "");
      setError(null);
    }
  }, [open, manualLocation]);

  const handleSave = () => {
    setError(null);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError(t("invalidCoordinates"));
      return;
    }

    if (lat < -90 || lat > 90) {
      setError(t("invalidLatitude"));
      return;
    }

    if (lng < -180 || lng > 180) {
      setError(t("invalidLongitude"));
      return;
    }

    const location = { lat, lng };
    setManualLocation(location);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLatitude("");
    setLongitude("");
    setError(null);
    setManualLocation(null);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <FloatingLabelInput
            error={!!error}
            helperText={error || t("latitudeHelper")}
            inputProps={{
              name: "latitude",
              onChange: (e) => {
                setLatitude(e.target.value);
                setError(null);
              },
              type: "number",
              value: latitude,
            }}
            label={t("latitude")}
          />
          <FloatingLabelInput
            error={!!error}
            helperText={error || t("longitudeHelper")}
            inputProps={{
              name: "longitude",
              onChange: (e) => {
                setLongitude(e.target.value);
                setError(null);
              },
              type: "number",
              value: longitude,
            }}
            label={t("longitude")}
          />
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleClear} type="button" variant="outline">
            {t("clear")}
          </Button>
          <Button onClick={handleSave} type="button">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
