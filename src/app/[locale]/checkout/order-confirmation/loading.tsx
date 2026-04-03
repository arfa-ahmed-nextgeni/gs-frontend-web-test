import { CheckoutHeader } from "@/components/checkout/checkout-header/checkout-header";
import Container from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderConfirmationLoading() {
  return (
    <div className="bg-[#F7F8FA]">
      <CheckoutHeader />

      <Container>
        <div className="pb-10 pt-2 lg:px-5 lg:pb-16">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[797px_394px] lg:gap-[10px]">
            {/* Left Column - Main Content */}
            <div className="space-y-4">
              {/* Hero Section Skeleton */}
              <div>
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-6">
                  <Skeleton className="h-20 w-20 rounded-full lg:h-[100px] lg:w-[100px]" />
                  <div className="w-full space-y-2 text-center lg:text-left">
                    <Skeleton className="mx-auto h-14 w-3/4 lg:mx-0 lg:h-16" />
                    <Skeleton className="mx-auto h-5 w-1/2 lg:mx-0" />
                  </div>
                </div>
                <Skeleton className="mt-5 h-12 w-full rounded-lg lg:mt-6" />
              </div>

              {/* Products List Section Skeleton */}
              <section className="rounded-lg bg-white">
                <div className="space-y-3 px-5 py-5">
                  {[1, 2, 3].map((item) => (
                    <div
                      className="flex flex-col gap-4 px-5 py-2.5 lg:flex-row lg:items-center lg:gap-6"
                      key={item}
                    >
                      <div className="flex items-center gap-4 lg:w-[50%]">
                        <Skeleton className="h-5 w-10" />
                        <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
                        <div className="flex flex-1 flex-col gap-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-4 lg:gap-8">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Order Details */}
            <div className="flex flex-col gap-3">
              {/* Order Meta Section Skeleton */}
              <section className="rounded-lg bg-white p-4 lg:p-5">
                <Skeleton className="h-6 w-32" />
                <div className="mt-2 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </section>

              {/* Price Breakdown Section Skeleton */}
              <section className="rounded-lg bg-white p-4 lg:p-5">
                <Skeleton className="h-6 w-32" />
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#EEF0F2] pt-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </section>

              {/* Delivery Address Section Skeleton */}
              <section className="rounded-lg bg-white p-4 lg:p-5">
                <Skeleton className="h-6 w-32" />
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2 pt-2" />
                </div>
              </section>
            </div>
          </div>
        </div>
      </Container>

      {/* Fixed Bottom Button Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E8EBF0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] justify-end px-4 py-2">
          <Skeleton className="h-[50px] w-full max-w-[390px]" />
        </div>
      </div>
    </div>
  );
}
