"use client";

import { useCallback, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { trackShipmentAction } from "@/lib/actions/order/track-shipment-action";

type TrackShipmentResponse = Awaited<ReturnType<typeof trackShipmentAction>>;

export const useShipmentTracking = () => {
  const [error, setError] = useState<null | string>(null);
  const [trackingData, setTrackingData] =
    useState<TrackShipmentResponse["data"]>(null);

  const trackShipmentMutation = useMutation({
    mutationFn: trackShipmentAction,
    mutationKey: ["order", "track-shipment"],
  });
  const {
    isPending,
    mutateAsync,
    reset: resetMutation,
  } = trackShipmentMutation;

  const trackOrder = useCallback(
    async (orderId: string, trackingNumber: string) => {
      setError(null);

      try {
        const result = await mutateAsync({
          orderId,
          trackingNumber,
        });

        if (result.success && result.data) {
          setTrackingData(result.data);
        } else {
          setError(result.error || "Failed to track shipment");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to track shipment";
        setError(errorMessage);

        return {
          data: null,
          error: errorMessage,
          status: 0,
          success: false,
        };
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    resetMutation();
    setError(null);
    setTrackingData(null);
  }, [resetMutation]);

  return {
    error,
    isLoading: isPending,
    reset,
    trackingData,
    trackOrder,
  };
};
