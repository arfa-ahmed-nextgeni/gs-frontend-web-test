import Container from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductAdditionalInfoSkeleton = () => {
  return (
    <Container className="mb-5">
      <div className="bg-bg-default flex w-full flex-col rounded-xl">
        <Skeleton className="ms-5 mt-5 h-10 w-32" />

        <div className="border-border-base flex flex-col gap-1 border-t p-5">
          {[...Array(3)].map((_, index) => (
            <Skeleton className="h-4 w-2/3" key={index} />
          ))}
        </div>
      </div>
    </Container>
  );
};
