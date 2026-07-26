import "server-only";

import { restRequest } from "@/lib/clients/rest";
import { ORDER_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { StoreCode } from "@/lib/constants/i18n";

export interface ShipmentTrackingResponse {
  carrier: string;
  currency?: string;
  delivery_status: string;
  grand_total: string;
  message: string;
  status: boolean;
  tracking_number: string;
  tracking_status?: string;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  comments?: string;
  update_code: string;
  update_date_time: string;
  update_description: string;
  update_location: string;
}

export async function trackShipment({
  orderId,
  storeCode,
  trackingNumber,
}: {
  orderId: string;
  storeCode: StoreCode;
  trackingNumber: string;
}): Promise<{
  data: null | ShipmentTrackingResponse;
  error: null | string;
  status: number;
  success: boolean;
}> {
  try {
    const result = await restRequest<ShipmentTrackingResponse>({
      endpoint: ORDER_ENDPOINTS.TRACK_SHIPMENT(
        orderId,
        trackingNumber,
        "incrementId"
      ),
      options: {
        method: "GET",
      },
      storeCode,
    });

    if (result.status === 200 && result.data.status) {
      return {
        data: result.data,
        error: null,
        status: result.status,
        success: true,
      };
    } else {
      return {
        data: result.data,
        error: result.data.message || "Failed to track shipment",
        status: result.status,
        success: false,
      };
    }
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
