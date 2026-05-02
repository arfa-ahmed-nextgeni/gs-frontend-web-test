import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { restRequest } from "@/lib/clients/rest";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { getStoreCode } from "@/lib/utils/country";

interface InvoiceResponse {
  message?: string;
  pdf_url: string;
  status?: string;
}

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  const locale = req.nextUrl.searchParams.get(QueryParamsKey.Locale) as Locale;
  try {
    if (!locale || !orderId) {
      return NextResponse.json(
        { error: "Missing locale or orderId" },
        { status: 400 }
      );
    }

    const authToken = await getAuthToken();

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required", success: false },
        { status: 401 }
      );
    }
    const decodedOrderId = Buffer.from(orderId, "base64").toString("utf-8");

    const response = await restRequest<InvoiceResponse>({
      authToken,
      endpoint: `/pdf/order/${decodedOrderId}/tax-invoice`,
      options: {
        method: "GET",
      },
      storeCode: getStoreCode(locale),
    });

    if (response.status !== 200) {
      return NextResponse.json(
        {
          error: `Failed to get invoice URL (${response.status})`,
          success: false,
        },
        { status: 400 }
      );
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "No Data available in response", success: false },
        { status: 404 }
      );
    }

    if (response.data && !response.data?.pdf_url) {
      return NextResponse.json(
        {
          error: response.data?.message || "PDF URL not found in response",
          success: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      pdf_url: response.data.pdf_url,
      success: true,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
