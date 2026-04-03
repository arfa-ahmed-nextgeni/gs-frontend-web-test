"use client";

import { useDirection } from "@radix-ui/react-direction";

import { CartDrawerHeader } from "@/components/cart/cart-drawer/cart-drawer-header";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "@/i18n/navigation";

export const CartDrawerSkeleton = () => {
  const router = useRouter();
  const direction = useDirection();

  const isMobile = useIsMobile();

  return (
    <Drawer
      direction={isMobile ? "bottom" : direction === "ltr" ? "right" : "left"}
      onOpenChange={router.back}
      open={true}
    >
      <DrawerContent className="bg-bg-body lg:!w-107.5 z-99 flex h-full flex-col border-none">
        <CartDrawerHeader />

        <div className="mx-5 flex shrink-0 flex-col items-center gap-2.5 pt-5">
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>

        <div className="max-h-90 min-h-0 flex-1 lg:max-h-none">
          <div className="h-35 lg:h-52.5 bg-bg-default mt-7.5 mx-5 flex flex-row rounded-2xl px-2.5 py-5 shadow-[0px_1px_0px_0px_rgba(243,243,243,1.00)] lg:px-5">
            <div className="max-w-25 lg:max-w-30 lg:w-30 flex w-[23.25vw] flex-col justify-between">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="border-border-base hidden h-10 flex-row rounded-3xl border lg:flex">
                <div className="flex flex-1 items-center justify-center">
                  <Skeleton className="size-3" />
                </div>

                <div className="flex flex-1 items-center justify-center overflow-hidden">
                  <Skeleton className="h-5 w-3" />
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <Skeleton className="size-3" />
                </div>
              </div>
            </div>
            <div className="ms-2.5 flex flex-1 flex-col justify-between lg:gap-4 lg:ltr:!ml-5 lg:rtl:!mr-5">
              <div className="flex flex-row justify-between gap-5 lg:flex-col">
                <div className="hidden items-end justify-end lg:flex">
                  <Skeleton className="h-6.25 w-12 rounded-2xl" />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="w-22 h-4" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-2.5 w-full" />
                    <Skeleton className="h-2.5 w-2/5" />
                  </div>
                </div>

                <div className="gap-1.25 flex flex-col lg:hidden">
                  <Skeleton className="h-6.25 w-12 rounded-2xl" />
                  <Skeleton className="h-6.25 w-12 rounded-2xl" />
                </div>
              </div>

              <div className="hidden lg:flex">
                <Skeleton className="h-6.25 w-12 rounded-2xl" />
              </div>

              <div className="flex flex-row items-center gap-2.5">
                <div className="border-border-base max-w-30 flex h-10 w-[28vw] flex-row rounded-3xl border lg:hidden">
                  <div className="flex flex-1 items-center justify-center">
                    <Skeleton className="size-3" />
                  </div>

                  <div className="flex flex-1 items-center justify-center overflow-hidden">
                    <Skeleton className="h-5 w-3" />
                  </div>

                  <div className="flex flex-1 items-center justify-center">
                    <Skeleton className="size-3" />
                  </div>
                </div>

                <Skeleton className="w-15 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-border-base flex shrink-0 flex-row items-center justify-between border-y px-5 py-3.5">
          <div className="flex flex-row items-center gap-2.5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-9" />
          </div>
          <Skeleton className="h-6 w-14" />
        </div>

        <div className="bg-bg-default flex shrink-0 flex-row gap-2.5 p-5 lg:flex-col-reverse">
          <div className="h-12.5 border-border-base flex-1 rounded-xl border bg-transparent lg:block lg:flex-none lg:border-none">
            <Skeleton className="translate-1/2 h-6 w-1/2" />
          </div>
          <div className="bg-btn-bg-primary h-12.5 flex-1 rounded-xl lg:block lg:flex-none">
            <Skeleton className="translate-1/2 h-6 w-1/2" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
