import { Skeleton } from "@/components/ui/skeleton";

export function SiteLogoSkeleton() {
  return (
    <>
      <Skeleton aria-hidden="true" className="h-7.5 w-26.25 block lg:hidden" />
      <Skeleton aria-hidden="true" className="w-35 hidden h-10 lg:block" />
    </>
  );
}
