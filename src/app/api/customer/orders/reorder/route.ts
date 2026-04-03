import { NextRequest, NextResponse } from "next/server";

import { reorderCustomerOrder } from "@/lib/actions/customer/reorder-order";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { isError, isOk } from "@/lib/utils/service-result";

export async function POST(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get(
      QueryParamsKey.Locale
    ) as Locale;
    const body = await request.json();
    const { increment_id, reorder } = body;

    if (!increment_id || !locale) {
      return NextResponse.json(
        { error: "Locale and Order increment ID are required", success: false },
        { status: 400 }
      );
    }

    const result = await reorderCustomerOrder(increment_id, reorder, locale);

    if (isOk(result)) {
      return NextResponse.json({
        cart_id: result.data.cart_id,
        message: result.data.message,
        success: true,
      });
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
