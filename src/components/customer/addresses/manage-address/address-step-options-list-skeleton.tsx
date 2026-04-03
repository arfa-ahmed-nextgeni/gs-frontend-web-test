import { Skeleton } from "@/components/ui/skeleton";

export const AddressStepOptionsListSkeleton = () => {
  return [...Array(4)].map((_, letterIndex) => (
    <div className="mb-5" key={letterIndex}>
      <Skeleton className="mb-2.5 h-5 w-3" />
      <ul className="flex flex-wrap gap-0.5">
        {[...Array(4)].map((_, index) => (
          <li key={index}>
            <div className="h-8.75 bg-bg-default border-border-base flex w-20 items-center justify-center rounded-xl border px-2.5">
              <Skeleton className="h-3 w-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  ));
};
