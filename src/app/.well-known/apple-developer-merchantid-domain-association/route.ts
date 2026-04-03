import { NextRequest, NextResponse } from "next/server";

import { handleApplePayDomainAssociationRequest } from "@/lib/utils/apple-pay-domain";

/**
 * Apple Pay Domain Verification File Route (without .txt extension)
 *
 * Apple Pay requires the domain association file to be accessible at:
 * /.well-known/apple-developer-merchantid-domain-association
 *
 * This route serves domain-specific files based on the request hostname.
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
