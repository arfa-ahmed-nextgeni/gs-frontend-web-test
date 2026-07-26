"use client";

import { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";

import dynamic from "next/dynamic";

import { DirectionProvider } from "@radix-ui/react-direction";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { AnalyticsLaunchTracker } from "@/components/analytics/analytics-launch-tracker";
import { BannerTrackingListener } from "@/components/analytics/banner-tracking-listener";
import { ClickOriginListener } from "@/components/analytics/click-origin-listener";
import { GlobalCartDrawer } from "@/components/cart/cart-drawer/global-cart-drawer";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AnalyticsProvider } from "@/contexts/analytics-context";
import { AuthUIProvider } from "@/contexts/auth-ui-context";
import { BlurContextProvider } from "@/contexts/blur-context";
import { CartDrawerProvider } from "@/contexts/cart-drawer-context";
import { CartProvider } from "@/contexts/cart/cart-context";
import { MobileModalProvider } from "@/contexts/mobile-modal-context";
import { MobileTopBarContextProvider } from "@/contexts/mobile-top-bar-context";
import { NavigationProvider } from "@/contexts/navigation-context";
import { NotifyMeProvider } from "@/contexts/notify-me-context";
import { ProductReviewsProvider } from "@/contexts/product-reviews-context";
import { StoreConfigProvider } from "@/contexts/store-config-context";
import { UIProvider } from "@/contexts/ui/ui-context";
import { PendingWishlistProvider } from "@/contexts/wishlist/pending-wishlist-context";
import { WishlistProvider } from "@/contexts/wishlist/wishlist-context";
import { useBannerTrackingFlush } from "@/hooks/use-banner-tracking-flush";
import { useBlurOnScroll } from "@/hooks/use-blur-on-scroll";
import { usePathname } from "@/i18n/navigation";
import {
  isCategoryPath,
  isProductPath,
  isSearchPath,
} from "@/lib/utils/routes";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools
    ),
  {
    ssr: false,
  }
);

if (typeof window !== "undefined") {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(duration);

  // Disable browser-native scroll restoration on product/category/search pages synchronously at module evaluation time.
  // window.location.pathname here because the Next.js router isn't available yet.
  if ("scrollRestoration" in window.history) {
    const p = window.location.pathname;
    if (isCategoryPath(p) || isProductPath(p) || isSearchPath(p)) {
      window.history.scrollRestoration = "manual";
    }
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        networkMode: "always",
      },
      queries: {
        staleTime: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

function Providers({
  children,
  dir,
}: PropsWithChildren<{
  dir: "ltr" | "rtl";
}>) {
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const prevPathnameRef = useRef<null | string>(null);
  // Continuously tracks the latest scrollY so we always have the pre-navigation
  // value available when the pathname-change effect fires (by then the DOM has
  // already scrolled to 0 for the new page, so window.scrollY is useless).
  const lastScrollYRef = useRef(0);

  useBlurOnScroll();
  useBannerTrackingFlush();

  // Keep scrollRestoration in sync as the user navigates between page types.
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    if (
      isProductPath(pathname) ||
      isCategoryPath(pathname) ||
      isSearchPath(pathname)
    ) {
      window.history.scrollRestoration = "manual";
    } else {
      window.history.scrollRestoration = "auto";
    }
  }, [pathname]);

  // Update lastScrollY on every scroll event.
  useEffect(() => {
    const onScroll = () => {
      lastScrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Save scroll position when leaving a category/search page to a PDP, and
  // restore it when navigating back.
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (!prev) return;

    // Leaving category/search → entering PDP: snapshot the scroll position.
    if (
      (isCategoryPath(prev) || isSearchPath(prev)) &&
      isProductPath(pathname)
    ) {
      sessionStorage.setItem(`scroll:${prev}`, String(lastScrollYRef.current));
      return;
    }

    // Returning from PDP → back to category/search: restore after page renders.
    if (
      isProductPath(prev) &&
      (isCategoryPath(pathname) || isSearchPath(pathname))
    ) {
      const saved = sessionStorage.getItem(`scroll:${pathname}`);
      if (!saved) return;
      const scrollY = parseInt(saved, 10);

      // Wait for the page layout to load before restoring position.
      let frameCount = 0;
      const MAX_FRAMES = 300;
      const tryScroll = () => {
        frameCount++;
        const pageIsLoaded =
          document.documentElement.scrollHeight >= scrollY + window.innerHeight;

        if (pageIsLoaded || frameCount >= MAX_FRAMES) {
          sessionStorage.removeItem(`scroll:${pathname}`);
          window.scrollTo({ behavior: "instant", top: scrollY });
        } else {
          rafId = requestAnimationFrame(tryScroll);
        }
      };

      let rafId = requestAnimationFrame(tryScroll);
      return () => cancelAnimationFrame(rafId);
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <NavigationProvider>
          <DirectionProvider dir={dir}>
            <UIProvider>
              <AnalyticsProvider>
                <AnalyticsLaunchTracker />
                <BlurContextProvider>
                  <MobileModalProvider>
                    <ToastProvider>
                      <AuthUIProvider>
                        <ProductReviewsProvider>
                          <MobileTopBarContextProvider>
                            <StoreConfigProvider>
                              <CartProvider>
                                <WishlistProvider>
                                  <BannerTrackingListener />
                                  <ClickOriginListener />
                                  <PendingWishlistProvider>
                                    <NotifyMeProvider>
                                      <CartDrawerProvider>
                                        {children}
                                        <GlobalCartDrawer />
                                      </CartDrawerProvider>
                                    </NotifyMeProvider>
                                  </PendingWishlistProvider>
                                </WishlistProvider>
                              </CartProvider>
                            </StoreConfigProvider>
                          </MobileTopBarContextProvider>
                        </ProductReviewsProvider>
                      </AuthUIProvider>
                    </ToastProvider>
                  </MobileModalProvider>
                </BlurContextProvider>
              </AnalyticsProvider>
            </UIProvider>
          </DirectionProvider>
        </NavigationProvider>
      </NuqsAdapter>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}

export default Providers;
