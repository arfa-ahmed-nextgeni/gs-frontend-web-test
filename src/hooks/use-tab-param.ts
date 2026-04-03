import { useTransition } from "react";

import { Options, parseAsStringLiteral, useQueryState } from "nuqs";

import { QueryParamsKey } from "@/lib/constants/query-params";

type TabValues = readonly string[];

interface UseTabParamOptions<T extends TabValues> {
  defaultValue?: T[number];
  options?: Options;
  paramKey?: QueryParamsKey;
  tabs: T;
}

export function useTabParam<T extends TabValues>({
  defaultValue,
  options,
  paramKey = QueryParamsKey.Tab,
  tabs,
}: UseTabParamOptions<T>) {
  const [isLoading, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useQueryState(
    paramKey,
    parseAsStringLiteral(tabs)
      .withDefault(defaultValue || (tabs[0] as T[number]))
      .withOptions({
        startTransition,
        ...options,
      })
  );

  return {
    activeTab: activeTab as T[number],
    isLoading,
    setActiveTab,
  };
}
