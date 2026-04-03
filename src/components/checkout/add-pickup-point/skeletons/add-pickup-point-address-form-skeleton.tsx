import { Skeleton } from "@/components/ui/skeleton";

export const AddPickupPointAddressFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-20">
      <div className="gap-7.5 flex flex-col">
        {/* Locker location display */}
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-32" />
          <div className="bg-bg-default min-h-11.25 flex items-center gap-5 rounded-xl px-5 py-1">
            <Skeleton className="size-6.25 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* First Name and Last Name */}
        <div className="flex flex-row gap-2.5">
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Email */}
        <div>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>

      {/* Submit Button */}
      <Skeleton className="h-12.5 w-full rounded-xl" />
    </div>
  );
};
