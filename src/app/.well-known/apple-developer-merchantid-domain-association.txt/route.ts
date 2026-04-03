import { NextRequest, NextResponse } from "next/server";

import { handleApplePayDomainAssociationRequest } from "@/lib/utils/apple-pay-domain";

/**
 * Apple Pay Domain Verification File Route (with .txt extension)
 *
 * Serves the same content as the non-.txt route.
 * Apple provides files in .txt format; both URLs are supported for compatibility.
 *
 * /.well-known/apple-developer-merchantid-domain-association.txt
 *
 * Files are stored in: public/.well-known/{domain}/apple-developer-merchantid-domain-association.txt
 */
export async function GET(request: NextRequest) {
  try {
    return await handleApplePayDomainAssociationRequest(request);
  } catch (error) {
    console.error(
      `[Apple Pay Domain Verification] Error reading file for hostname ${request.headers.get("host")}:`,
      error
    );
    return new NextResponse("File not found", {
      status: 404,
    });
  }
}
