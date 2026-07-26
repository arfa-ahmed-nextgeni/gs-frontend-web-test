import { Skeleton } from "@/components/ui/skeleton";

export function OrderActionsSkeleton() {
  return (
    <div className="bg-bg-default mb-3 overflow-hidden rounded-xl border-0 py-0 shadow-none lg:block">
      <ul className="text-sm">
        {Array.from({ length: 3 }).map((_, index) => (
          <li
            className="border-border-base h-11.25 flex items-center justify-between border-t px-4 first:border-t-0"
            key={index}
          >
            <span className="flex items-center gap-3">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="w-30 h-4" />
            </span>
            {index === 2 ? (
              <Skeleton className="h-6 w-10 rounded-full" />
            ) : (
              <Skeleton className="size-5 rounded-full" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
