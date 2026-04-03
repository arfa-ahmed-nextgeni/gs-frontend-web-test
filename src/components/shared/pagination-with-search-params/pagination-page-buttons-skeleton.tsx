import { PaginationButtonSkeleton } from "@/components/shared/pagination-with-search-params/pagination-button-skeleton";
import { PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import {
  PAGINATION_ELLIPSIS,
  PaginationButtonType,
} from "@/lib/constants/pagination";
import { getPaginationRange } from "@/lib/utils/pagination";

export const PaginationPageButtonsSkeleton = ({
  totalPages,
}: {
  totalPages: number;
}) => {
  const pageNumbers = getPaginationRange(1, totalPages);

  return pageNumbers.map((pageNumber, index) => (
    <PaginationItem className="animate-pulse" key={index}>
      {pageNumber === PAGINATION_ELLIPSIS ? (
        <PaginationEllipsis />
      ) : (
        <PaginationButtonSkeleton
          page={+pageNumber}
          type={PaginationButtonType.Page}
        />
      )}
    </PaginationItem>
  ));
};
