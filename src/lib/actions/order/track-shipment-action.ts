"use server";

import { getLocale } from "next-intl/server";

import {
  type ShipmentTrackingResponse,
  trackShipment,
} from "@/lib/actions/order/tracking";
import { getStoreCode } from "@/lib/utils/country";

import type { Locale } from "@/lib/constants/i18n";

interface TrackShipmentActionPayload {
  orderId: string;
  trackingNumber: string;
  trackingType?: "incrementId" | "orderId";
}

interface TrackShipmentActionResponse {
  data: null | ShipmentTrackingResponse;
  error: null | string;
  status: number;
  success: boolean;
}

export async function trackShipmentAction({
  orderId,
  trackingNumber,
  trackingType,
}: TrackShipmentActionPayload): Promise<TrackShipmentActionResponse> {
  try {
    const locale = (await getLocale()) as Locale;

    return await trackShipment({
      orderId,
      storeCode: getStoreCode(locale),
      trackingNumber,
      trackingType,
    });
  } catch (error) {
    console.error("Error tracking shipment:", error);

    return {
      data: null,
      error: "Failed to track shipment",
      status: 0,
      success: false,
    };
  }
}
