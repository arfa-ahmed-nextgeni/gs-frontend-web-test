import { NextRequest, NextResponse } from "next/server";

import {
  ApiActivityFeatures,
  ApiActivityServices,
} from "@/lib/api-activity/api-activity-meta";
import { loggedFetch } from "@/lib/api-activity/fetch/logged-fetch";
import { CHECKOUT_PUBLIC_API_KEY } from "@/lib/config/server-env";

/**
 * API route to proxy Checkout.com token creation
 * This is needed because Checkout.com's tokens API doesn't support CORS
 * from browsers. This route acts as a minimal proxy.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.number || !body.expiry_month || !body.expiry_year || !body.cvv) {
      return NextResponse.json(
        { error: "Missing required card fields" },
        { status: 400 }
      );
    }

    if (!CHECKOUT_PUBLIC_API_KEY) {
      console.error("[create-token] CHECKOUT_PUBLIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "Checkout.com public key is not configured" },
        { status: 500 }
      );
    }

    const isSandbox =
      CHECKOUT_PUBLIC_API_KEY.startsWith("pk_test_") ||
      CHECKOUT_PUBLIC_API_KEY.startsWith("pk_sbox_");
    const checkoutApiUrl = isSandbox
      ? "https://api.sandbox.checkout.com/tokens"
      : "https://api.checkout.com/tokens";

    // Forward request to Checkout.com
    let checkoutResponse: Response;
    try {
      checkoutResponse = await loggedFetch(
        checkoutApiUrl,
        {
          body: JSON.stringify({
            cvv: body.cvv,
            expiry_month: body.expiry_month,
            expiry_year: body.expiry_year,
            number: body.number,
            type: "card",
          }),
          headers: {
            Authorization: `Bearer ${CHECKOUT_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        },
        {
          action: "create token",
          feature: ApiActivityFeatures.Checkout,
          initiator: "src/app/api/checkout/create-token/route.ts#POST",
          service: ApiActivityServices.Checkout,
        }
      );
    } catch (fetchError) {
      console.error("[create-token] Fetch error:", fetchError);
      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to connect to Checkout.com",
        },
        { status: 500 }
      );
    }

    let responseData;
    try {
      responseData = await checkoutResponse.json();
    } catch {
      // If response is not valid JSON, try to get text
      const responseText = await checkoutResponse.text().catch(() => "");
      console.error(
        "[create-token] Failed to parse Checkout.com response:",
        responseText
      );
      return NextResponse.json(
        {
          details: responseText || "Empty response",
          error: `Invalid response from Checkout.com: ${checkoutResponse.status} ${checkoutResponse.statusText}`,
        },
        { status: checkoutResponse.status || 500 }
      );
    }

    if (!checkoutResponse.ok) {
      const errorMessage =
        responseData.error_type ||
        responseData.message ||
        responseData.error ||
        `Failed to create token: ${checkoutResponse.statusText}`;
      console.error("[create-token] Checkout.com error:", responseData);
      return NextResponse.json(
        { details: responseData, error: errorMessage },
        { status: checkoutResponse.status }
      );
    }

    if (!responseData.token) {
      return NextResponse.json(
        { error: "No token in response from Checkout.com" },
        { status: 500 }
      );
    }

    // Return token and card details
    return NextResponse.json({
      bin: responseData.bin,
      card_type: responseData.type,
      expiry_month: responseData.expiry_month,
      expiry_year: responseData.expiry_year,
      issuer: responseData.issuer,
      issuer_country: responseData.issuer_country,
      last4: responseData.last4,
      token: responseData.token,
      type: responseData.type,
    });
  } catch (error) {
    console.error("[create-token] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create token",
      },
      { status: 500 }
    );
  }
}
