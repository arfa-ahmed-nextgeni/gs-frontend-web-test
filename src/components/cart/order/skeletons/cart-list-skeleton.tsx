import { Skeleton } from "@/components/ui/skeleton";

export function CartListSkeleton() {
  // Mimic 2–3 cart items visually
  const skeletonItems = Array.from({ length: 3 });

  return (
    <div className="space-y-4">
      {skeletonItems.map((_, i) => (
        <div
          className="flex gap-4 border-b border-gray-100 bg-white p-4 last:border-none lg:gap-5 lg:p-5"
          key={i}
        >
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Skeleton className="h-[90px] w-[90px] rounded-xl lg:h-[130px] lg:w-[130px]" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Title and Discount */}
            <div className="mb-2 flex items-start justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <Skeleton className="h-5 w-[80%]" />
              </div>
              <Skeleton className="h-6 w-[50px] flex-shrink-0 rounded-lg" />
            </div>

            {/* Description */}
            <div className="mb-4 space-y-1.5">
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-gray-50 px-2 py-1.5 lg:gap-3 lg:px-4 lg:py-2">
                  <Skeleton className="h-3.5 w-3.5 rounded-full lg:h-4 lg:w-4" />
                  <Skeleton className="h-4 w-5 lg:w-6" />
                  <Skeleton className="h-3.5 w-3.5 rounded-full lg:h-4 lg:w-4" />
                </div>
                <Skeleton className="h-4 w-14 lg:h-5 lg:w-16" />
              </div>

              {/* Wishlist */}
              <Skeleton className="h-8 w-8 rounded-xl lg:h-10 lg:w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
