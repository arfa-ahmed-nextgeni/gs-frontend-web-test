import {
  PaginationFirst,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationButtonType } from "@/lib/constants/pagination";

export const PaginationButtonSkeleton = ({
  page,
  type,
}: {
  page?: number;
  type: PaginationButtonType;
}) => {
  switch (type) {
    case PaginationButtonType.First:
      return (
        <PaginationFirst
          aria-disabled={true}
          className="pointer-events-none"
          href="/"
        />
      );
    case PaginationButtonType.Last:
      return (
        <PaginationLast
          aria-disabled={true}
          className="pointer-events-none"
          href="/"
        />
      );
    case PaginationButtonType.Next:
      return (
        <PaginationNext
          aria-disabled={true}
          className="pointer-events-none"
          href="/"
        />
      );
    case PaginationButtonType.Page:
      return (
        <PaginationLink
          aria-disabled={true}
          className="pointer-events-none"
          href="/"
        >
          {page}
        </PaginationLink>
      );
    case PaginationButtonType.Prev:
      return (
        <PaginationPrevious
          aria-disabled={true}
          className="pointer-events-none"
          href="/"
        />
      );
    default:
      return null;
  }
};
