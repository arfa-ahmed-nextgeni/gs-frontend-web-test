"use client";

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

  useBlurOnScroll();
  useBannerTrackingFlush();

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
