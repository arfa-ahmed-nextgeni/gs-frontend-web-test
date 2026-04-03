import { Skeleton } from "@/components/ui/skeleton";

export const AddressStepSelectorSkeleton = () => {
  return (
    <div className="flex flex-1 overflow-y-auto py-5">
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex flex-row items-center gap-2.5 px-5">
          <Skeleton className="w-35 h-5" />
        </div>
        <div className="px-5">
          <Skeleton className="rounded-4xl h-10 w-full" />
        </div>
        <div className="me-2.5 flex-1 flex-col gap-5 pe-2.5 ps-5">
          {[...Array(4)].map((_, letterIndex) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};
