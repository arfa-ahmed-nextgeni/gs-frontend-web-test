import { type NextRequest, NextResponse } from "next/server";

import {
  ApiActivityFeatures,
  ApiActivityServices,
} from "@/lib/api-activity/api-activity-meta";
import { loggedFetch } from "@/lib/api-activity/fetch/logged-fetch";
import { getHostKeyFromRequest } from "@/lib/utils/sitemap/get-host-key-from-request";

const SITEMAP_S3_BASE_URL =
  "https://s3-eu-west-1.amazonaws.com/gs-euw1-public-data-prod/sitemaps";

export async function getSitemapResponse({
  preferredLanguage,
  request,
}: {
  preferredLanguage: "ar" | "en";
  request: NextRequest;
}) {
  const reqHost =
    request.headers.get("host") ||
    request.headers.get("x-forwarded-host") ||
    "";

  const hostname = reqHost.split(":")[0] || "";
  const hostKey = await getHostKeyFromRequest(reqHost, preferredLanguage);

  if (!hostKey) {
    console.error(
      `[sitemap.xml] Unable to resolve sitemap host key. domain=${hostname}`
    );
    return new NextResponse("Unable to resolve sitemap host key", {
      status: 500,
    });
  }

  const fallbackHostKey = swapLanguagePrefix(hostKey);
  const sitemapUrl = `${SITEMAP_S3_BASE_URL}/${hostKey}.xml`;

  try {
    const response = await loggedFetch(
      sitemapUrl,
      {
        method: "GET",
        signal: AbortSignal.timeout(10_000),
      },
      {
        action: "fetch sitemap",
        feature: ApiActivityFeatures.Seo,
        initiator:
          "src/lib/utils/sitemap/get-sitemap-response.ts#getSitemapResponse",
        service: ApiActivityServices.Sitemap,
      }
    );

    if (response.status === 404) {
      if (!fallbackHostKey) return new NextResponse(null, { status: 404 });

      const fallbackUrl = `${SITEMAP_S3_BASE_URL}/${fallbackHostKey}.xml`;
      const fallbackResponse = await loggedFetch(
        fallbackUrl,
        {
          method: "GET",
          signal: AbortSignal.timeout(10_000),
        },
        {
          action: "fetch sitemap",
          feature: ApiActivityFeatures.Seo,
          initiator:
            "src/lib/utils/sitemap/get-sitemap-response.ts#getSitemapResponse:fallback",
          service: ApiActivityServices.Sitemap,
        }
      );

      if (fallbackResponse.status === 404) {
        return new NextResponse(null, { status: 404 });
      }

      if (!fallbackResponse.ok) {
        console.error(
          `[sitemap.xml] Fallback fetch failed from S3. domain=${hostname} hostKey=${fallbackHostKey} status=${fallbackResponse.status}`
        );
        return new NextResponse(null, { status: 500 });
      }

      const fallbackXml = await fallbackResponse.text();
      return new NextResponse(fallbackXml, {
        headers: {
          "Content-Type": "text/xml",
        },
        status: 200,
      });
    }

    if (!response.ok) {
      console.error(
        `[sitemap.xml] Failed to fetch from S3. domain=${hostname} hostKey=${hostKey} status=${response.status}`
      );
      return new NextResponse(null, { status: 500 });
    }

    const xml = await response.text();

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "text/xml",
      },
      status: 200,
    });
  } catch (error) {
    console.error(
      `[sitemap.xml] Error fetching from S3. domain=${hostname} hostKey=${hostKey}`,
      error
    );
    return new NextResponse(null, { status: 500 });
  }
}

function swapLanguagePrefix(hostKey: string) {
  if (hostKey.startsWith("en_")) return hostKey.replace(/^en_/, "ar_");
  if (hostKey.startsWith("ar_")) return hostKey.replace(/^ar_/, "en_");
  return "";
}
