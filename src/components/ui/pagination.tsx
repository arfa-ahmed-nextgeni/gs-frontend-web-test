import * as React from "react";

import { useLocale } from "next-intl";

import { FirstPageIcon } from "@/components/icons/first-page-icon";
import { LastPageIcon } from "@/components/icons/last-page-icon";
import { NextPageIcon } from "@/components/icons/next-page-icon";
import { PreviousPageIcon } from "@/components/icons/previous-page-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PAGINATION_ELLIPSIS } from "@/lib/constants/pagination";
import { getDirection } from "@/lib/utils/get-direction";
import { cn } from "@/lib/utils/index";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  Pick<React.ComponentProps<typeof Link>, "onNavigate"> &
  React.ComponentProps<"a">;

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      data-slot="pagination"
      role="navigation"
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "flex flex-row items-center gap-2.5 [&[dir='rtl']]:flex-row-reverse",
        className
      )}
      data-slot="pagination-content"
      {...props}
    />
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-7.5 text-text-primary font-gilroy flex items-end justify-center text-xl font-medium",
        className
      )}
      data-slot="pagination-ellipsis"
      {...props}
    >
      {PAGINATION_ELLIPSIS}
      <span className="sr-only">More pages</span>
    </span>
  );
}

function PaginationFirst({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const locale = useLocale();
  const direction = getDirection(locale);

  // In RTL, First should show LastPageIcon (double right arrow >>)
  const IconComponent = direction === "rtl" ? LastPageIcon : FirstPageIcon;

  return (
    <PaginationLink
      aria-label="Go to first page"
      className={cn("gap-1 px-2.5", className)}
      size="default"
      {...props}
    >
      <IconComponent
        fill={
          props?.isActive
            ? "var(--color-svg-icon-light)"
            : "var(--color-svg-icon-dark)"
        }
      />
      <span className="sr-only">First page</span>
    </PaginationLink>
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLast({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const locale = useLocale();
  const direction = getDirection(locale);

  const IconComponent = direction === "rtl" ? FirstPageIcon : LastPageIcon;

  return (
    <PaginationLink
      aria-label="Go to last page"
      className={cn("gap-1 px-2.5", className)}
      size="default"
      {...props}
    >
      <span className="sr-only">Last page</span>
      <IconComponent
        fill={
          props?.isActive
            ? "var(--color-svg-icon-light)"
            : "var(--color-svg-icon-dark)"
        }
      />
    </PaginationLink>
  );
}

function PaginationLink({
  children,
  className,
  href,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-disabled={isActive}
      className={cn(
        buttonVariants({
          size,
          variant: "ghost",
        }),
        "text-text-primary font-gilroy min-w-7.5 min-h-7.5 flex items-center justify-center rounded-full border-none text-xl font-medium",
        className,
        { "pointer-events-none": isActive }
      )}
      data-active={isActive}
      data-slot="pagination-link"
      href={href ?? "#"}
      {...props}
    >
      {children}
    </Link>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const locale = useLocale();
  const direction = getDirection(locale);

  // In RTL, Next should show PreviousPageIcon (left arrow <)
  const IconComponent = direction === "rtl" ? PreviousPageIcon : NextPageIcon;

  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("gap-1 px-2.5", className)}
      size="default"
      {...props}
    >
      <span className="sr-only">Next</span>
      <IconComponent
        fill={
          props?.isActive
            ? "var(--color-svg-icon-light)"
            : "var(--color-svg-icon-dark)"
        }
      />
    </PaginationLink>
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const locale = useLocale();
  const direction = getDirection(locale);

  const IconComponent = direction === "rtl" ? NextPageIcon : PreviousPageIcon;

  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("gap-1 px-2.5", className)}
      size="default"
      {...props}
    >
      <IconComponent
        fill={
          props?.isActive
            ? "var(--color-svg-icon-light)"
            : "var(--color-svg-icon-dark)"
        }
      />
      <span className="sr-only">Previous</span>
    </PaginationLink>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
