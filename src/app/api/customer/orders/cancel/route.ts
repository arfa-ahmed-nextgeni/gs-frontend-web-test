import { NextRequest, NextResponse } from "next/server";

import { cancelCustomerOrder } from "@/lib/actions/customer/cancel-order";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { isError, isOk } from "@/lib/utils/service-result";

export async function POST(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get(
      QueryParamsKey.Locale
    ) as Locale;
    const body = await request.json();
    const { orderId } = body;

    if (!locale || !orderId) {
      return NextResponse.json(
        { error: "Locale and Order ID are required", success: false },
        { status: 400 }
      );
    }

    const result = await cancelCustomerOrder(orderId, locale);

    if (isOk(result)) {
      return NextResponse.json({ message: result.data.message, success: true });
    } else if (isError(result)) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Authentication required", success: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
