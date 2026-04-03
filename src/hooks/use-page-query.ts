import { useTransition } from "react";

import { Options, parseAsInteger, useQueryState } from "nuqs";

import { QueryParamsKey } from "@/lib/constants/query-params";

export const usePageQuery = (options?: Options) => {
  const [isLoading, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useQueryState(
    QueryParamsKey.Page,
    parseAsInteger.withDefault(1).withOptions({
      scroll: true,
      shallow: false,
      startTransition,
      ...options,
    })
  );

  return {
    currentPage,
    isLoading,
    setCurrentPage,
  };
};
