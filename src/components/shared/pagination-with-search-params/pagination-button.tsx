"use client";

import { useSearchParams } from "next/navigation";

import {
  PaginationFirst,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePagination } from "@/contexts/pagination-context";
import { usePathname } from "@/i18n/navigation";
import { PaginationButtonType } from "@/lib/constants/pagination";
import { QueryParamsKey } from "@/lib/constants/query-params";

export const PaginationButton = ({
  page,
  totalPages,
  type,
}: {
  page?: number;
  totalPages: number;
  type: PaginationButtonType;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentPage, setCurrentPage } = usePagination();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete(QueryParamsKey.Page);
    } else {
      params.set(QueryParamsKey.Page, page.toString());
    }

    const paramsString = params.toString();

    return paramsString ? `?${paramsString}` : pathname;
  };

  const commonProps = (targetPage: number) => ({
    href: createPageUrl(targetPage),
    onClick: () => setCurrentPage(targetPage),
    onNavigate: (e: { preventDefault: () => void }) => {
      e.preventDefault();
    },
  });

  switch (type) {
    case PaginationButtonType.First:
      return (
        <PaginationFirst
          className={currentPage === 1 ? "pointer-events-none" : ""}
          isActive={currentPage === 1}
          {...commonProps(1)}
        />
      );
    case PaginationButtonType.Last:
      return (
        <PaginationLast
          isActive={currentPage === totalPages}
          {...commonProps(totalPages)}
        />
      );
    case PaginationButtonType.Next:
      return (
        <PaginationNext
          isActive={currentPage === totalPages}
          {...commonProps(currentPage + 1)}
        />
      );
    case PaginationButtonType.Page:
      return (
        <PaginationLink
          className={page === currentPage ? "bg-btn-bg-muted" : ""}
          isActive={page === currentPage}
          {...commonProps(page as number)}
        >
          {page}
        </PaginationLink>
      );
    case PaginationButtonType.Prev:
      return (
        <PaginationPrevious
          isActive={currentPage === 1}
          {...commonProps(currentPage - 1)}
        />
      );
    default:
      return null;
  }
};
