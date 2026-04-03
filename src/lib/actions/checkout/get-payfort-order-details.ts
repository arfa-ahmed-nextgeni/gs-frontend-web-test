"use server";

import { getTranslations } from "next-intl/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { restRequest } from "@/lib/clients/rest";
import { Locale } from "@/lib/constants/i18n";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok } from "@/lib/utils/service-result";

// Transformed result type (camelCase, payfortDetail as object)
export type GetPayfortOrderDetailsResult = {
  amount: number;
  currency: string;
  customer_email: string;
  payfortDetail: {
    access_code: string;
    currency: string;
    language: string;
    merchant_identifier: string;
    merchant_reference: string;
    return_url: string;
    service_command: string;
    signature: string;
    url: string;
  };
};

export type PayfortOrderDetails = {
  amount: number;
  currency: string;
  payfortDetail?: {
    access_code: string;
    currency: string;
    language: string;
    merchant_identifier: string;
    merchant_reference: string;
    return_url: string;
    service_command: string;
    signature: string;
    url: string;
  };
};

// Parsed payfort_detail structure
type PayfortDetailParsed = {
  access_code: string;
  amount: number;
  currency: string;
  language: string;
  merchant_identifier: string;
  merchant_reference: string;
  return_url: string;
  service_command: string;
  signature: string;
  url: string;
};

// Raw API response type (snake_case, payfort_detail as JSON string)
type PayfortOrderDetailsRawResponse = {
  amount: number;
  base_currency: string;
  currency: string;
  customer_email: string;
  language: string;
  method: string;
  orderid: string;
  payfort_detail: string; // JSON string that needs to be parsed
  product_reference: string;
  url: string;
};

export async function getPayfortOrderDetailsAction({
  locale,
  orderId,
}: {
  locale: Locale;
  orderId: string;
}) {
  const tCommonErrors = await getTranslations("CommonErrors");
  const authToken = await getAuthToken();

  try {
    const storeCode = getStoreCode(locale);

    const response = await restRequest<PayfortOrderDetailsRawResponse>({
      authToken: authToken ?? undefined,
      endpoint: `/payfort/order?orderId=${orderId}`,
      options: {
        method: "GET",
      },
      storeCode,
    });

    if (response.status !== 200) {
      const errorMessage =
        response.data &&
        typeof response.data === "object" &&
        "message" in response.data
          ? String(response.data.message)
          : "Failed to get Payfort order details";
      return failure(errorMessage);
    }

    if (!response.data) {
      return failure("Empty response from Payfort order details API");
    }

    // Check if response has the expected structure
    // Response should have: amount, currency, and payfort_detail (as JSON string)
    if (
      typeof response.data.amount === "undefined" ||
      typeof response.data.currency === "undefined" ||
      !response.data.payfort_detail
    ) {
      return failure("Invalid Payfort order details response structure");
    }

    // Parse payfort_detail from JSON string to object
    // Normalize payfort_detail (handles JSON string, array, or object)
    const payfortDetailParsed = normalizePayfortDetail(
      response.data.payfort_detail,
      response.data.url
    );

    if (!payfortDetailParsed) {
      return failure(
        "Failed to parse Payfort details: Invalid payfort_detail format"
      );
    }

    // Transform response to match expected structure (camelCase)
    const transformedData: GetPayfortOrderDetailsResult = {
      amount: response.data.amount,
      currency: response.data.currency,
      customer_email: response.data.customer_email || "",
      payfortDetail: {
        access_code: payfortDetailParsed.access_code,
        currency: payfortDetailParsed.currency,
        language: payfortDetailParsed.language,
        merchant_identifier: payfortDetailParsed.merchant_identifier,
        merchant_reference: payfortDetailParsed.merchant_reference,
        return_url: payfortDetailParsed.return_url,
        service_command: payfortDetailParsed.service_command,
        signature: payfortDetailParsed.signature,
        url: payfortDetailParsed.url,
      },
    };

    return ok<GetPayfortOrderDetailsResult>(transformedData);
  } catch (error) {
    return failure(
      getCommonErrorMessage({
        error,
        fallbackMessage: "Failed to get Payfort order details",
        tCommonErrors,
      })
    );
  }
}

// Normalize different shapes of `payfort_detail` returned by API into a
// consistent `PayfortDetailParsed` object. `raw` can be:
// - a JSON string (credit card flow),
// - an array of ordered values (apple pay flow),
// - or already an object.
function normalizePayfortDetail(
  raw: unknown,
  fallbackUrl?: string
): null | PayfortDetailParsed {
  try {
    let obj: any;

    if (Array.isArray(raw)) {
      const arr = raw as unknown[];
      obj = {
        access_code: arr[1],
        amount: arr[5],
        currency: arr[6],
        language: arr[7],
        merchant_identifier: arr[2],
        merchant_reference: arr[3],
        return_url: arr[4],
        service_command: arr[0],
        // array responses sometimes don't include signature/url; use fallbacks
        signature: arr[8] ?? "",
        url: arr[9] ?? fallbackUrl ?? "",
      };
    } else if (typeof raw === "string") {
      obj = JSON.parse(raw);
    } else if (raw && typeof raw === "object") {
      obj = raw;
    } else {
      return null;
    }

    return {
      access_code: String(obj.access_code ?? ""),
      amount: Number(obj.amount ?? 0),
      currency: String(obj.currency ?? ""),
      language: String(obj.language ?? ""),
      merchant_identifier: String(obj.merchant_identifier ?? ""),
      merchant_reference: String(obj.merchant_reference ?? ""),
      return_url: String(obj.return_url ?? ""),
      service_command: String(obj.service_command ?? ""),
      signature: String(obj.signature ?? ""),
      url: String(obj.url ?? fallbackUrl ?? ""),
    };
  } catch {
    return null;
  }
}
