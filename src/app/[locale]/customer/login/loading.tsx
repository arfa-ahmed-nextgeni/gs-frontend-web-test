import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerLoginLoading() {
  return (
    <div className="overflow-y-auto bg-white lg:hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="me-2.5 h-5 w-5" />
      </div>

      <div className="p-5">
        <div className="mb-8">
          <Skeleton className="mb-2 h-9 w-32" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="mb-6">
          <div className="flex h-[50px] gap-2 rtl:flex-row-reverse">
            <div className="flex h-[50px] w-[120px] items-center rounded-xl bg-gray-100 px-3 rtl:flex-row-reverse">
              <Skeleton className="mr-2 h-[15px] w-[20px]" />
              <Skeleton className="h-5 w-10" />
            </div>

            <div className="relative flex-1">
              <div className="relative flex h-[50px] items-center rounded-xl bg-[#FAFAFA] px-4 py-6">
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <Skeleton className="mb-1 h-4 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>

        <Skeleton className="h-[50px] w-full rounded-xl" />
      </div>
    </div>
  );
}
