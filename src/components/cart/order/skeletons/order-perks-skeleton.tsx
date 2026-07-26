import { Skeleton } from "@/components/ui/skeleton";

export function OrderPerksSkeleton() {
  return (
    <div className="bg-bg-default mt-3 overflow-hidden rounded-xl border-0 px-1.5 py-0 shadow-none">
      <ul className="text-sm">
        {Array.from({ length: 3 }).map((_, index) => (
          <li
            className="border-border-base flex items-center justify-between border-t px-4 py-2.5 first:border-t-0"
            key={index}
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="size-5.5 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
