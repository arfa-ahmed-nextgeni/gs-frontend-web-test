import { HEADERS } from "@/lib/constants/api";

export function applyForwardHeaders(
  targetHeaders: Headers,
  forwardHeaders?: HeadersInit
): void {
  if (!forwardHeaders) {
    return;
  }

  new Headers(forwardHeaders).forEach((value, key) => {
    targetHeaders.set(key, value);
  });
}

export function getForwardedRequestHeadersFrom(
  sourceHeaders: Pick<Headers, "get">
): Headers {
  const forwardHeaders = new Headers();
  const clientIp = getClientIpFromHeaders(sourceHeaders);
  const userAgent = sourceHeaders.get(HEADERS.USER_AGENT);

  if (clientIp) {
    forwardHeaders.set(HEADERS.X_FORWARDED_FOR, clientIp);
    forwardHeaders.set(HEADERS.X_REAL_IP, clientIp);
    forwardHeaders.set(HEADERS.TRUE_CLIENT_IP, clientIp);
    forwardHeaders.set(HEADERS.FORWARDED, `for=${clientIp}`);
  }
  if (userAgent) {
    forwardHeaders.set(HEADERS.USER_AGENT, userAgent);
  }

  return forwardHeaders;
}

function getClientIpFromHeaders(
  sourceHeaders: Pick<Headers, "get">
): string | undefined {
  // CloudFront does not set X-Forwarded-For itself (that's an ALB/ELB
  // behavior) — it injects the real viewer IP via `CloudFront-Viewer-Address`
  // instead (format `ip:port`). Any X-Forwarded-For value present downstream
  // of CloudFront reflects whatever hop is directly in front of this app
  // (e.g. an internal ALB), not the original browser, so this header is
  // checked first when present.
  const cloudFrontViewerAddress = sourceHeaders.get(
    HEADERS.CLOUDFRONT_VIEWER_ADDRESS
  );
  if (cloudFrontViewerAddress) {
    // Strip the trailing `:port` — IPv6 addresses are bracketed
    // (`[::1]:1234`), IPv4 addresses are not (`1.2.3.4:1234`).
    const withoutPort = cloudFrontViewerAddress.startsWith("[")
      ? cloudFrontViewerAddress.slice(1, cloudFrontViewerAddress.indexOf("]"))
      : cloudFrontViewerAddress.split(":")[0];
    if (withoutPort) return withoutPort;
  }

  const trueClientIp = sourceHeaders.get(HEADERS.TRUE_CLIENT_IP);
  if (trueClientIp) return trueClientIp;

  const forwardedFor = sourceHeaders.get(HEADERS.X_FORWARDED_FOR);
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || undefined;
  }

  return sourceHeaders.get(HEADERS.X_REAL_IP) ?? undefined;
}
