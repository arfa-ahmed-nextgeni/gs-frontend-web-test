"use server";

import { revalidatePath } from "next/cache";

import { mergeGuestCart } from "@/lib/actions/cart/merge-guest-cart";
import { deleteCartId, getCartId } from "@/lib/actions/cookies/cart";
import {
  deleteCustomerId,
  deleteCustomerUuid,
  setCustomerId,
  setCustomerUuid,
} from "@/lib/actions/cookies/customer";
import {
  ApiActivityFeatures,
  ApiActivityServices,
} from "@/lib/api-activity/api-activity-meta";
import { loggedFetch } from "@/lib/api-activity/fetch/logged-fetch";
import { restRequest } from "@/lib/clients/rest";
import { GRAPHQL_BASE_URL } from "@/lib/config/client-env";
import { AUTH_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { StoreCode } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";

export async function logout({
  storeCode,
  token,
}: {
  storeCode: StoreCode;
  token?: string;
}) {
  try {
    const mutation = `
      mutation RevokeCustomerToken {
        revokeCustomerToken {
          result
        }
      }
    `;

    const graphqlUrl = GRAPHQL_BASE_URL;

    if (!graphqlUrl) {
      console.error("GraphQL base URL not configured");
      return {
        data: null,
        error: "GraphQL endpoint not configured",
        status: 0,
        success: false,
      };
    }

    const headers: Record<string, string> = {
      Accept: "application/graphql-response+json",
      "Content-Type": "application/json",
      Store: storeCode,
    };

    // Add authorization header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await loggedFetch(
      graphqlUrl,
      {
        body: JSON.stringify({
          query: mutation,
        }),
        headers,
        method: "POST",
      },
      {
        feature: ApiActivityFeatures.Auth,
        initiator: "src/lib/actions/auth/otp.ts#logout",
        service: ApiActivityServices.Graphql,
      }
    );

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GraphQL request failed:", response.status, errorText);
      return {
        data: null,
        error: `GraphQL request failed: ${response.status}`,
        status: response.status,
        success: false,
      };
    }

    const result = await response.json();

    if (result.data?.revokeCustomerToken?.result) {
      await deleteCartId();
      await deleteCustomerId();
      await deleteCustomerUuid();
      return {
        data: result.data.revokeCustomerToken,
        message: "Logged out successfully",
        status: 200,
        success: true,
      };
    } else {
      return {
        data: null,
        error: result.errors?.[0]?.message || "Failed to logout",
        status: 400,
        success: false,
      };
    }
  } catch (error) {
    console.error("Error logging out:", error);
    return {
      data: null,
      error: "Failed to logout",
      status: 0,
      success: false,
    };
  }
}

export async function otpLogin({
  mobile,
  storeCode,
  type,
}: {
  mobile: string;
  storeCode: StoreCode;
  type: "sms" | "whatsapp";
}) {
  try {
    const result = await restRequest<{
      message: string;
      success: boolean;
    }>({
      endpoint: AUTH_ENDPOINTS.OTP_LOGIN,
      options: {
        body: JSON.stringify({
          mobile,
          type,
        }),
        method: "POST",
      },
      storeCode,
    });

    // Check if status is 200
    if (result.status === 200) {
      return {
        data: result.data,
        message: "OTP sent successfully",
        status: result.status,
        success: true,
      };
    } else {
      return {
        data: null,
        error: result.data.message,
        status: result.status,
        success: false,
      };
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      data: null,
      error: "Failed to send OTP",
      status: 0,
      success: false,
    };
  }
}

export async function otpVerify({
  mobile,
  otp,
  storeCode,
}: {
  mobile: string;
  otp: string;
  storeCode: StoreCode;
}) {
  try {
    const result = await restRequest<{
      accounts?: string;
      cart_id?: string;
      customer_id: string;
      customer_uuid?: string;
      is_registered: string;
      message: string;
      success: boolean;
      token: string;
    }>({
      endpoint: AUTH_ENDPOINTS.OTP_VERIFY,
      options: {
        body: JSON.stringify({
          mobile,
          otp,
        }),
        method: "POST",
      },
      storeCode,
    });

    // Check if the API response indicates success
    if (result.status === 200 && result.data.success) {
      const guestCartId = await getCartId();

      if (guestCartId) {
        await mergeGuestCart({
          authToken: result.data.token,
          guestCartId,
        });
      }

      if (result.data.customer_id) {
        await setCustomerId(result.data.customer_id);
      }

      if (result.data.customer_uuid) {
        await setCustomerUuid(result.data.customer_uuid);
      }

      revalidatePath(ROUTES.CUSTOMER.ROOT, "layout");

      return {
        data: result.data,
        message: result.data.message || "OTP verified successfully",
        status: result.status,
        success: true,
      };
    } else {
      return {
        data: result.data,
        error: result.data.message || "Invalid OTP or session expired",
        status: result.status,
        success: false,
      };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      data: null,
      error: "Invalid OTP or session expired",
      status: 0,
      success: false,
    };
  }
}

export async function selectAccount({
  customerId,
  mobile,
  otp,
  storeCode,
}: {
  customerId: string;
  mobile: string;
  otp: string;
  storeCode: StoreCode;
}) {
  try {
    const result = await restRequest<{
      customer_id?: string;
      message: string;
      success: boolean;
      token?: string;
    }>({
      endpoint: AUTH_ENDPOINTS.SELECT_ACCOUNT,
      options: {
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          mobile,
          otp,
        }),
        method: "POST",
      },
      storeCode,
    });

    // Check if the API response indicates success
    if (result.status === 200 && result.data.success) {
      if (result.data.customer_id) {
        await setCustomerId(result.data.customer_id);
      }

      return {
        data: result.data,
        message: result.data.message || "Account selected successfully",
        status: result.status,
        success: true,
      };
    } else {
      return {
        data: result.data,
        error: result.data.message || "Failed to select account",
        status: result.status,
        success: false,
      };
    }
  } catch (error) {
    console.error("Error selecting account:", error);
    return {
      data: null,
      error: "Failed to select account",
      status: 0,
      success: false,
    };
  }
}
