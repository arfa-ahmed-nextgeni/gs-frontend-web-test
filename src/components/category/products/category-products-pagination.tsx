"use client";

import { PaginationWithSearchParams } from "@/components/shared/pagination-with-search-params";

export function CategoryProductsPagination({
  totalPages,
  withProvider = true,
}: {
  totalPages: number;
  withProvider?: boolean;
}) {
  return (
    <div className="mt-8">
      <PaginationWithSearchParams
        containerProps={{
          className: "flex",
        }}
        queryOptions={{
          scroll: true,
        }}
        totalPages={totalPages}
        withProvider={withProvider}
      />
    </div>
  );
}
