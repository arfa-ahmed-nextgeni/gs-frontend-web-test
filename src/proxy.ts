import { NextRequest, NextResponse } from "next/server";

import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { CookieName } from "@/lib/constants/cookies";
import { PaymentStatus } from "@/lib/constants/payment-status";
import { ROUTES } from "@/lib/constants/routes";
import { PendingOrderInfo } from "@/lib/types/checkout/order";
import { getOpenAppRedirectResponse } from "@/lib/utils/open-app-redirect";
import { getBaseUrlFromRequest } from "@/lib/utils/request";
import { isOrderConfirmationPath } from "@/lib/utils/routes";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes: string[] = [
  ROUTES.CUSTOMER.PROFILE.ROOT,
  ROUTES.CUSTOMER.CARDS,
  ROUTES.CUSTOMER.RETURNS,
  ROUTES.CUSTOMER.TICKETS,
];
const authRoutes: string[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.CUSTOMER.LOGIN,
];

export default async function proxy(request: NextRequest) {
  const openAppRedirectResponse = getOpenAppRedirectResponse(request);
  if (openAppRedirectResponse) {
    return openAppRedirectResponse;
  }

  const ua = request.headers.get("user-agent") ?? "";
  const { pathname } = request.nextUrl;

  // Health-check / probe detection
  const isHealthCheck =
    ua === "ELB-HealthChecker/2.0" || // AWS ALB exact match
    ua.startsWith("kube-probe/") || // Kubernetes default probe
    ua.includes("HealthChecker") || // variations
    ua.toLowerCase().includes("health"); // broad fallback for custom probes

  // Target only the paths that are likely being probed and causing issues
  const isProbedPath =
    pathname === "/" || pathname === "/en" || pathname === "/en/"; // exact /en (add more if needed)

  // Early return for health checks → prevents streaming corruption
  if (isHealthCheck && isProbedPath) {
    // Very lightweight response – no routing, no RSC, no async
    console.info(
      `Health check early-return: UA=${ua.slice(0, 50)}, path=${pathname}`
    );
    return new NextResponse("OK", {
      headers: {
        "Content-Type": "text/plain",
      },
      status: 200,
    });
  }

  const response = intlMiddleware(request);

  if (response && !response.ok) {
    // response not in the range 200-299 (usually a redirect)
    // no need to execute the auth middleware
    return response;
  }

  return await authMiddleware(request, response);
}

async function authMiddleware(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  const [, language, ...segments] = pathname.split("/");
  const basePathname = `/${segments.join("/")}`;
  const baseUrl = getBaseUrlFromRequest(request);

  // Check if user is returning from payment gateway via browser back button
  const pendingOrderInfo = request.cookies.get(
    CookieName.PENDING_ORDER_INFO
  )?.value;

  const isOrderConfirmation = isOrderConfirmationPath(basePathname);

  if (pendingOrderInfo && !isOrderConfirmation) {
    // User came back from payment gateway, redirect to refill-cart API
    const pendingOrderInfoParsed = JSON.parse(
      pendingOrderInfo
    ) as PendingOrderInfo;

    const refillCartPath = ROUTES.CHECKOUT.REFILL_CART_API(
      PaymentStatus.Cancelled
    );
    const refillCartUrl = new URL(
      refillCartPath,
      pendingOrderInfoParsed.baseUrl
    );

    return NextResponse.redirect(refillCartUrl, 303);
  }

  const isProtectedRoute = protectedRoutes.includes(basePathname);
  const isAuthRoute = authRoutes.includes(basePathname);
  const isAuthorized = !!(await getAuthToken());

  if ((isProtectedRoute && !isAuthorized) || (isAuthRoute && isAuthorized)) {
    return NextResponse.redirect(new URL(`/${language}`, baseUrl));
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  matcher: [
    // Skip Next.js internals, static files, sitemap routes, and well-known paths
    // - API routes: /api, /trpc
    // - Next.js internals: /_next, /_vercel
    // - Static files: files with extensions (.*\\..*)
    // - Sitemap: /sitemap, /sitemap.xml
    // - Well-known: /.well-known
    "/((?!api|trpc|_next|_vercel|\\.well-known|sitemap|.*\\..*).*)",
  ],
};
