import { ComponentProps, Suspense } from "react";

import { useLocale } from "next-intl";
import { Options } from "nuqs";

import { PaginationButton } from "@/components/shared/pagination-with-search-params/pagination-button";
import { PaginationButtonSkeleton } from "@/components/shared/pagination-with-search-params/pagination-button-skeleton";
import { PaginationPageButtons } from "@/components/shared/pagination-with-search-params/pagination-page-buttons";
import { PaginationPageButtonsSkeleton } from "@/components/shared/pagination-with-search-params/pagination-page-buttons-skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { PaginationProvider } from "@/contexts/pagination-context";
import { PaginationButtonType } from "@/lib/constants/pagination";
import { cn } from "@/lib/utils";
import { getDirection } from "@/lib/utils/get-direction";

export const PaginationWithSearchParams = ({
  containerProps,
  maxVisiblePages,
  mobileScroll,
  paginationContentProps,
  queryOptions,
  totalPages,
  withProvider = true,
}: {
  containerProps?: ComponentProps<typeof Pagination>;
  maxVisiblePages?: number;
  mobileScroll?: boolean;
  paginationContentProps?: ComponentProps<typeof PaginationContent>;
  queryOptions?: Options;
  totalPages: number;
  withProvider?: boolean;
}) => {
  const locale = useLocale();
  const direction = getDirection(locale);
  const showNavigationButtons = totalPages > 1;

  const pagination = (
    <Pagination {...containerProps} dir={direction}>
      <PaginationContent
        {...paginationContentProps}
        className={cn("gap-1 lg:gap-10", paginationContentProps?.className)}
      >
        {showNavigationButtons && (
          <PaginationContent className="gap-0.5 lg:gap-1">
            <PaginationItem>
              <Suspense
                fallback={
                  <PaginationButtonSkeleton type={PaginationButtonType.First} />
                }
              >
                <PaginationButton
                  totalPages={totalPages}
                  type={PaginationButtonType.First}
                />
              </Suspense>
            </PaginationItem>

            <PaginationItem>
              <Suspense
                fallback={
                  <PaginationButtonSkeleton type={PaginationButtonType.Prev} />
                }
              >
                <PaginationButton
                  totalPages={totalPages}
                  type={PaginationButtonType.Prev}
                />
              </Suspense>
            </PaginationItem>
          </PaginationContent>
        )}

        <PaginationContent>
          <Suspense
            fallback={<PaginationPageButtonsSkeleton totalPages={totalPages} />}
          >
            <PaginationPageButtons
              maxVisiblePages={maxVisiblePages}
              totalPages={totalPages}
            />
          </Suspense>
        </PaginationContent>

        {showNavigationButtons && (
          <PaginationContent className="gap-1">
            <PaginationItem>
              <Suspense
                fallback={
                  <PaginationButtonSkeleton type={PaginationButtonType.Next} />
                }
              >
                <PaginationButton
                  totalPages={totalPages}
                  type={PaginationButtonType.Next}
                />
              </Suspense>
            </PaginationItem>

            <PaginationItem>
              <Suspense
                fallback={
                  <PaginationButtonSkeleton type={PaginationButtonType.Last} />
                }
              >
                <PaginationButton
                  totalPages={totalPages}
                  type={PaginationButtonType.Last}
                />
              </Suspense>
            </PaginationItem>
          </PaginationContent>
        )}
      </PaginationContent>
    </Pagination>
  );

  if (!withProvider) {
    return pagination;
  }

  return (
    <PaginationProvider mobileScroll={mobileScroll} queryOptions={queryOptions}>
      {pagination}
    </PaginationProvider>
  );
};
