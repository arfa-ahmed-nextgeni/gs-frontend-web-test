"use client";

import { PaginationButton } from "@/components/shared/pagination-with-search-params/pagination-button";
import { PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { usePagination } from "@/contexts/pagination-context";
import {
  PAGINATION_ELLIPSIS,
  PaginationButtonType,
} from "@/lib/constants/pagination";
import { getPaginationRange } from "@/lib/utils/pagination";

export const PaginationPageButtons = ({
  maxVisiblePages,
  totalPages,
}: {
  maxVisiblePages?: number;
  totalPages: number;
}) => {
  const { currentPage } = usePagination();

  const pageNumbers = getPaginationRange(
    currentPage,
    totalPages,
    maxVisiblePages
  );

  return pageNumbers.map((pageNumber, index) => (
    <PaginationItem key={index}>
      {pageNumber === PAGINATION_ELLIPSIS ? (
        <PaginationEllipsis />
      ) : (
        <PaginationButton
          page={+pageNumber}
          totalPages={totalPages}
          type={PaginationButtonType.Page}
        />
      )}
    </PaginationItem>
  ));
};
