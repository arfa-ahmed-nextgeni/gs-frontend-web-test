import { unstable_noStore } from "next/cache";
import { NextResponse } from "next/server";

import { getCustomerPaymentCards } from "@/lib/actions/customer/get-customer-payment-cards";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

export async function GET(request: Request) {
  // Check for cache-busting query parameter
  const { searchParams } = new URL(request.url);
  const noCache = searchParams.get("nocache") === "true";

  // Bypass React cache if cache-busting is requested
  if (noCache) {
    unstable_noStore();
  }

  const result = await getCustomerPaymentCards();

  if (isUnauthenticated(result)) {
    return NextResponse.json(
      { data: null, error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  if (isError(result)) {
    return NextResponse.json(
      { data: null, error: result.error },
      { status: 500 }
    );
  }

  if (!isOk(result)) {
    return NextResponse.json(
      { data: null, error: "Failed to fetch payment cards" },
      { status: 500 }
    );
  }

  const paymentCards = result.data.paymentCards
    .filter((card) => {
      const hasSourceId = card.sourceId && card.sourceId.trim().length > 0;
      return hasSourceId;
    })
    .map((card) => ({
      bin: card.bin || "",
      cardNetwork: card.cardNetwork,
      checkoutPaymentId: card.checkoutPaymentId || null,
      expiry: card.expiry,
      id: card.id,
      isDefault: card.isDefault,
      isExpired: card.isExpired,
      last4: card.last4,
      sourceId: card.sourceId.trim(),
    }));

  return NextResponse.json(
    { data: { paymentCards }, error: null },
    { status: 200 }
  );
}
