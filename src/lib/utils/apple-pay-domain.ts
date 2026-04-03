import type { NextRequest } from "next/server";

import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Utility functions for Apple Pay domain mapping
 */

/**
 * Gets the file path for Apple Pay domain association file based on hostname
 *
 * Files are stored in: public/.well-known/{domain}/apple-developer-merchantid-domain-association.txt
 * (Apple provides files in .txt format)
 *
 * @param hostname - The hostname from the request (e.g., "dev.web.goldenscent.com", "ae.goldenscent.com")
 * @returns Relative path to the domain association file
 *
 * @example
 * // Dev SA: public/.well-known/dev.web.goldenscent.com/apple-developer-merchantid-domain-association.txt
 * // Prod SA: public/.well-known/goldenscent.com/apple-developer-merchantid-domain-association.txt
 * // Dev AE: public/.well-known/dev-ae.web.goldenscent.com/apple-developer-merchantid-domain-association.txt
 * // Prod AE: public/.well-known/ae.goldenscent.com/apple-developer-merchantid-domain-association.txt
 */
export function getApplePayDomainAssociationFilePath(hostname: string): string {
  // Return path based on domain name
  // Format: .well-known/{domain}/apple-developer-merchantid-domain-association.txt
  return `.well-known/${hostname}/apple-developer-merchantid-domain-association.txt`;
}

/**
 * Handles GET request for Apple Pay domain association file.
 * Serves domain-specific files based on request hostname.
 * Accepts both /.well-known/apple-developer-merchantid-domain-association and
 * /.well-known/apple-developer-merchantid-domain-association.txt
 */
export async function handleApplePayDomainAssociationRequest(
  request: NextRequest
) {
  const hostname =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.hostname ||
    "";

  const relativePath = getApplePayDomainAssociationFilePath(hostname);
  const filePath = join(process.cwd(), "public", relativePath);

  const fileContent = await readFile(filePath, "utf-8");

  return new Response(fileContent, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain",
      "X-Content-Type-Options": "nosniff",
    },
    status: 200,
  });
}
