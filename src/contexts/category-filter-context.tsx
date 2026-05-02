"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useRef,
  useTransition,
} from "react";

import { debounce, parseAsString, useQueryStates } from "nuqs";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "@/i18n/client-navigation";
import { trackFilterApply } from "@/lib/analytics/events";
import { PRICE_RANGE_BOUNDS } from "@/lib/constants/category/category-filters";
import { CategorySortKey } from "@/lib/constants/category/category-sort";
import { QueryParamsKey } from "@/lib/constants/query-params";

export type CategoryFilters = {
  checkboxes: Record<string, string[]>;
  priceMax?: null | number;
  priceMin?: null | number;
  sortBy?: string;
};

const FILTER_ID_TO_ATTRIBUTE: Record<string, string> = {
  areaOfApplication: "area_of_application",
  brand_new: "brand_new",
  character: "character",
  concentration: "concentration",
  fragrance_notes: "fragrance_notes",
  gender: "gender",
  makeUpColor: "makeup_color",
  makeUpType: "makeup_type",
  perfume_category: "perfume_category",
  perfumeNotes: "perfume_notes",
  product_category: "product_category",
  product_color: "product_color",
  productCategory: "product_category",
  productType: "product_type",
  shopByBrand: "brand_new",
  shopByGender: "gender",
  size_new: "size_new",
  use_time: "use_time",
};

const ATTRIBUTE_TO_FILTER_IDS = Object.entries(FILTER_ID_TO_ATTRIBUTE).reduce(
  (acc, [uiId, attribute]) => {
    if (!acc[attribute]) {
      acc[attribute] = [];
    }
    acc[attribute].push(uiId);
    return acc;
  },
  {} as Record<string, string[]>
);

const RESERVED_QUERY_KEYS = new Set([
  QueryParamsKey.Page,
  QueryParamsKey.Price,
  QueryParamsKey.Search,
  QueryParamsKey.Sort,
]);
const PRICE_QUERY_DEBOUNCE = debounce(300);

type CategoryFilterContextValue = {
  clearAllFiltersExceptSearch: () => void;
  clearCheckboxesForSection: (section: string) => void;
  isNavigationPending: boolean;
  resetToDefaults: () => void;
  setCheckboxesBulk: (map: Record<string, string[]>) => void;
  setCheckboxesForSection: (section: string, values: string[]) => void;
  setPrice: (min?: null | number, max?: null | number) => void;
  setSort: (sortBy?: string) => void;
  state: CategoryFilters;
  toggleCheckbox: (section: string, value: string) => void;
};

function getAttributeFromFilterId(filterId: string): string {
  return FILTER_ID_TO_ATTRIBUTE[filterId] || filterId;
}

function getFilterIdsFromAttribute(attribute: string): string[] {
  const mappedFilterIds = ATTRIBUTE_TO_FILTER_IDS[attribute] || [];
  const allFilterIds = [...mappedFilterIds, attribute];
  return Array.from(new Set(allFilterIds));
}

function getSelectedAttributes(
  checkboxes: Record<string, string[]>
): Set<string> {
  return new Set(
    Object.keys(checkboxes).map((filterId) =>
      getAttributeFromFilterId(filterId)
    )
  );
}

function normalizeSort(sortBy: null | string): string | undefined {
  if (!sortBy) {
    return undefined;
  }

  return Object.values(CategorySortKey).includes(sortBy as CategorySortKey)
    ? sortBy
    : undefined;
}

function parseCheckboxesFromSearchParams(
  searchParams: URLSearchParams
): Record<string, string[]> {
  const checkboxes: Record<string, string[]> = {};

  searchParams.forEach((value, key) => {
    if (RESERVED_QUERY_KEYS.has(key as QueryParamsKey)) {
      return;
    }

    const uiFilterIds = getFilterIdsFromAttribute(key);
    uiFilterIds.forEach((uiFilterId) => {
      if (!checkboxes[uiFilterId]) {
        checkboxes[uiFilterId] = [];
      }

      if (!checkboxes[uiFilterId].includes(value)) {
        checkboxes[uiFilterId].push(value);
      }
    });
  });

  return checkboxes;
}

function parsePrice(price: null | string): {
  max: null | number;
  min: null | number;
} {
  if (!price) {
    return { max: null, min: null };
  }

  const [minValue, maxValue] = price.split("-");
  const min = minValue === "" ? null : Number(minValue);
  const max = maxValue === "" ? null : Number(maxValue);

  return {
    max: Number.isFinite(max) ? max : null,
    min: Number.isFinite(min) ? min : null,
  };
}

const CategoryFilterContext = createContext<
  CategoryFilterContextValue | undefined
>(undefined);

export function CategoryFilterProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParamsString = searchParams?.toString() || "";
  const latestSearchParamsRef = useRef(searchParamsString);

  if (latestSearchParamsRef.current !== searchParamsString) {
    latestSearchParamsRef.current = searchParamsString;
  }

  const urlCheckboxes = useMemo(
    () =>
      parseCheckboxesFromSearchParams(new URLSearchParams(searchParamsString)),
    [searchParamsString]
  );

  const [checkboxes, setOptimisticCheckboxes] = useOptimistic(urlCheckboxes);
  const [isNavigationPending, startNavigationTransition] = useTransition();

  const [queryStates, setQueryStates] = useQueryStates(
    {
      [QueryParamsKey.Page]: parseAsString,
      [QueryParamsKey.Price]: parseAsString,
      [QueryParamsKey.Sort]: parseAsString,
    },
    {
      scroll: false,
      shallow: false,
      startTransition: startNavigationTransition,
    }
  );

  const price = queryStates[QueryParamsKey.Price];
  const sort = queryStates[QueryParamsKey.Sort];

  const { max: priceMax, min: priceMin } = useMemo(
    () => parsePrice(price),
    [price]
  );

  const sortBy = useMemo(() => normalizeSort(sort), [sort]);

  const state = useMemo<CategoryFilters>(
    () => ({
      checkboxes,
      priceMax,
      priceMin,
      sortBy,
    }),
    [checkboxes, priceMax, priceMin, sortBy]
  );

  const readCurrentSearchParams = useCallback(() => {
    const params = new URLSearchParams(latestSearchParamsRef.current);

    if (price) {
      params.set(QueryParamsKey.Price, price);
    } else {
      params.delete(QueryParamsKey.Price);
    }

    if (sortBy) {
      params.set(QueryParamsKey.Sort, sortBy);
    } else {
      params.delete(QueryParamsKey.Sort);
    }

    return params;
  }, [price, sortBy]);

  const navigateWithParams = useCallback(
    (nextParams: URLSearchParams) => {
      nextParams.delete(QueryParamsKey.Page);
      const nextQuery = nextParams.toString();
      latestSearchParamsRef.current = nextQuery;
      trackFilterApply();

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router]
  );

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = readCurrentSearchParams();
      updater(params);
      const optimisticCheckboxes = parseCheckboxesFromSearchParams(params);

      startNavigationTransition(() => {
        setOptimisticCheckboxes(optimisticCheckboxes);
        navigateWithParams(params);
      });
    },
    [
      navigateWithParams,
      readCurrentSearchParams,
      setOptimisticCheckboxes,
      startNavigationTransition,
    ]
  );

  const setCheckboxesForSection = useCallback(
    (section: string, values: string[]) => {
      const attribute = getAttributeFromFilterId(section);
      const normalizedValues = Array.from(
        new Set(values.map((value) => value.trim()))
      ).filter((value) => value.length > 0);

      updateParams((params) => {
        params.delete(attribute);
        normalizedValues.forEach((value) => {
          params.append(attribute, value);
        });
      });
    },
    [updateParams]
  );

  const clearCheckboxesForSection = useCallback(
    (section: string) => {
      const attribute = getAttributeFromFilterId(section);
      updateParams((params) => {
        params.delete(attribute);
      });
    },
    [updateParams]
  );

  const setCheckboxesBulk = useCallback(
    (map: Record<string, string[]>) => {
      updateParams((params) => {
        getSelectedAttributes(state.checkboxes).forEach((attribute) => {
          params.delete(attribute);
        });

        Object.entries(map).forEach(([section, values]) => {
          const attribute = getAttributeFromFilterId(section);
          values.forEach((value) => {
            params.append(attribute, value);
          });
        });
      });
    },
    [state.checkboxes, updateParams]
  );

  const setPrice = useCallback(
    (min?: null | number, max?: null | number) => {
      const minValue = min ?? null;
      const maxValue = max ?? null;

      const isDefaultMin = minValue === PRICE_RANGE_BOUNDS.MIN;
      const isDefaultMax = maxValue === PRICE_RANGE_BOUNDS.MAX;

      const nextPrice =
        (minValue === null && maxValue === null) ||
        (isDefaultMin && isDefaultMax)
          ? null
          : `${minValue ?? ""}-${maxValue ?? ""}`;

      trackFilterApply();
      void setQueryStates(
        {
          [QueryParamsKey.Page]: null,
          [QueryParamsKey.Price]: nextPrice,
        },
        {
          limitUrlUpdates: PRICE_QUERY_DEBOUNCE,
        }
      );
    },
    [setQueryStates]
  );

  const setSort = useCallback(
    (nextSortBy?: string) => {
      const normalizedSort = normalizeSort(nextSortBy ?? null);
      trackFilterApply();
      void setQueryStates({
        [QueryParamsKey.Page]: null,
        [QueryParamsKey.Sort]: normalizedSort ?? null,
      });
    },
    [setQueryStates]
  );

  const toggleCheckbox = useCallback(
    (section: string, value: string) => {
      const currentValues = state.checkboxes[section] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value];

      setCheckboxesForSection(section, nextValues);
    },
    [setCheckboxesForSection, state.checkboxes]
  );

  const clearAllFiltersExceptSearch = useCallback(() => {
    updateParams((params) => {
      getSelectedAttributes(state.checkboxes).forEach((attribute) => {
        params.delete(attribute);
      });

      params.delete(QueryParamsKey.Price);
      params.delete(QueryParamsKey.Sort);
    });
  }, [state.checkboxes, updateParams]);

  const resetToDefaults = clearAllFiltersExceptSearch;

  const contextValue = useMemo(
    () => ({
      clearAllFiltersExceptSearch,
      clearCheckboxesForSection,
      isNavigationPending,
      resetToDefaults,
      setCheckboxesBulk,
      setCheckboxesForSection,
      setPrice,
      setSort,
      state,
      toggleCheckbox,
    }),
    [
      clearAllFiltersExceptSearch,
      clearCheckboxesForSection,
      isNavigationPending,
      resetToDefaults,
      setCheckboxesBulk,
      setCheckboxesForSection,
      setPrice,
      setSort,
      state,
      toggleCheckbox,
    ]
  );

  return (
    <CategoryFilterContext.Provider value={contextValue}>
      {children}
    </CategoryFilterContext.Provider>
  );
}

export function useCategoryFilters() {
  const context = useContext(CategoryFilterContext);

  if (!context) {
    throw new Error(
      "useCategoryFilters must be used within CategoryFilterProvider"
    );
  }

  return context;
}

export const useFilters = useCategoryFilters;
export const FilterProvider = CategoryFilterProvider;
