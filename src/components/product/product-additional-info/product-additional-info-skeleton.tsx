import Container from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

const OPEN_SECTION_ROWS = 10;
const CLOSED_SECTION_COUNT = 2;

export const ProductAdditionalInfoSkeleton = () => {
  return (
    <Container className="lg:mt-7.5 mb-5">
      <div className="bg-bg-default w-full rounded-xl">
        {/* Open accordion item (Product Information) */}
        <div className="border-border-base border-b">
          <div className="h-12.5 flex items-center justify-between px-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="size-5" />
          </div>
          <div className="border-border-base flex flex-col gap-2.5 border-t p-5">
            {[...Array(OPEN_SECTION_ROWS)].map((_, index) => (
              <div className="flex flex-row gap-2" key={`row-${index}`}>
                <Skeleton className="h-4 w-[40%] lg:w-[15%]" />
                <Skeleton className="h-4 max-w-60 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Closed accordion items (About + Ingredients) */}
        {[...Array(CLOSED_SECTION_COUNT)].map((_, index) => (
          <div
            className={
              index === CLOSED_SECTION_COUNT - 1
                ? ""
                : "border-border-base border-b"
            }
            key={`closed-${index}`}
          >
            <div className="h-12.5 flex items-center justify-between px-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="size-5" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};
