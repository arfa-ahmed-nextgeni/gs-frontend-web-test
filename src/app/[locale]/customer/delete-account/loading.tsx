import { Skeleton } from "@/components/ui/skeleton";

export default function DeleteAccountLoading() {
  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      <div className="gap-3.75 py-3.75 bg-bg-warm mx-5 flex animate-pulse flex-row items-center rounded-xl px-5">
        <Skeleton className="size-6 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="w-50 h-4 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-0">
          {[...Array(6)].map((_, index) => (
            <div
              className="h-12.5 bg-bg-default border-border-base flex items-center justify-between border-b px-5"
              key={index}
            >
              <div className="flex flex-1 flex-row items-center">
                <Skeleton className="w-50 h-4 rounded" />
              </div>
              <Skeleton className="size-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
