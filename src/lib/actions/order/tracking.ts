import "server-only";

import { restRequest } from "@/lib/clients/rest";
import { ORDER_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { StoreCode } from "@/lib/constants/i18n";

export interface ShipmentTrackingResponse {
  carrier: string;
  delivery_status: string;
  grand_total: string;
  message: string;
  status: boolean;
  tracking_number: string;
  updates: any;
}

export async function trackShipment({
  orderId,
  storeCode,
  trackingNumber,
  trackingType = "incrementId",
}: {
  orderId: string;
  storeCode: StoreCode;
  trackingNumber: string;
  trackingType?: "incrementId" | "orderId";
}): Promise<{
  data: null | ShipmentTrackingResponse;
  error: null | string;
  status: number;
  success: boolean;
}> {
  try {
    const encodedOrderId = Buffer.from(orderId).toString("base64");

    const result = await restRequest<ShipmentTrackingResponse>({
      endpoint: ORDER_ENDPOINTS.TRACK_SHIPMENT(
        encodedOrderId,
        trackingNumber,
        trackingType === "incrementId" ? "incrementId" : undefined
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
