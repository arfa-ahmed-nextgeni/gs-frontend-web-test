import Container from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const BrandsHeaderSkeleton = () => {
  return (
    <>
      <Container className="mt-5 hidden lg:block">
        <Skeleton className="w-33 h-8" />
      </Container>
      <Container className="scrollbar-hidden mt-5 flex flex-row justify-start gap-2.5 overflow-x-auto lg:mt-2.5 lg:justify-center">
        {[...Array(5)].map((_, index) => (
          <Skeleton className="w-18.5 h-7" key={index} />
        ))}
      </Container>
    </>
  );
};
