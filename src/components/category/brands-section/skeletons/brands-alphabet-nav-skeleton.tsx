import { Skeleton } from "@/components/ui/skeleton";

export const BrandsAlphabetNavSkeleton = () => {
  return (
    <div className="mt-12.5 flex flex-col items-center justify-center gap-2.5 lg:mt-0 lg:flex-row lg:flex-wrap lg:gap-5">
      {[...Array(26)].map((_, index) => (
        <Skeleton className="h-7 w-2.5" key={index} />
      ))}
    </div>
  );
};
