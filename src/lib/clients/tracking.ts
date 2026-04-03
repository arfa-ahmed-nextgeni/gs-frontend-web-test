import { REST_BASE_URL } from "@/lib/config/client-env";
import { API_CONSTANTS, HEADERS } from "@/lib/constants/api";
import { ORDER_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { StoreCode } from "@/lib/constants/i18n";
import { isTimeoutError } from "@/lib/utils/network-error";

export interface ShipmentTrackingResponse {
  carrier: string;
  delivery_status: string;
  grand_total: string;
  message: string;
  status: boolean;
  tracking_number: string;
  updates: any;
}

export async function trackShipmentClient({
  orderId,
  storeCode,
  trackingNumber,
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
    const encodedOrderId = btoa(orderId);

    const url = `${REST_BASE_URL}/${storeCode}/V1${ORDER_ENDPOINTS.TRACK_SHIPMENT(
      encodedOrderId,
      trackingNumber
    )}`;

    const response = await fetch(url, {
      headers: {
        [HEADERS.CONTENT_TYPE]: "application/json",
      },
      method: "GET",
      signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
    });

    const data = await response.json();

    if (
      response.status === 200 &&
      (data.success || data.status === "success" || data.status === true)
    ) {
      return {
        data,
        error: null,
        status: response.status,
        success: true,
      };
    } else {
      return {
        data,
        error: data.message || data.error || "Failed to track shipment",
        status: response.status,
        success: false,
      };
    }
  } catch (error) {
    console.error("Error tracking shipment:", error);
    return {
      data: null,
      error: isTimeoutError(error)
        ? "timeoutError"
        : "Failed to track shipment",
      status: 0,
      success: false,
    };
  }
}
