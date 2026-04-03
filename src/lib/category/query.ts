import { PRICE_UPPER_BOUND_INCLUSIVE_STEP } from "@/lib/constants/category/category-filters";
import { CategorySortKey } from "@/lib/constants/category/category-sort";
import { QueryParamsKey } from "@/lib/constants/query-params";

const RESERVED_FILTER_KEYS = new Set([
  "currentPage",
  "filters",
  "locale",
  "pageSize",
  QueryParamsKey.CategoryPath,
  QueryParamsKey.CategoryUid,
  QueryParamsKey.Page,
  QueryParamsKey.PageSize,
  QueryParamsKey.Price,
  QueryParamsKey.Search,
  QueryParamsKey.Sort,
  "sort",
  "sortBy",
]);

const FILTER_KEY_PATTERN = /^[A-Za-z0-9_]+$/;
const PRICE_RANGE_PATTERN = /^(\d+(\.\d+)?)?-(\d+(\.\d+)?)?$/;

export function appendFiltersToParams(
  params: URLSearchParams,
  filters: Record<string, string[]>
) {
  Object.entries(filters).forEach(([key, values]) => {
    values.forEach((value) => {
      params.append(key, value);
    });
  });
}

export function parseFiltersFromSearchParamsRecord(searchParams: {
  [key: string]: string | string[] | undefined;
}): Record<string, string[]> {
  const filters: Record<string, string[]> = {};

  Object.entries(searchParams).forEach(([key, rawValue]) => {
    if (rawValue === undefined) {
      return;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const normalizedValues = normalizeFilterValues(values);

    if (normalizedValues.length === 0) {
      return;
    }

    if (key === QueryParamsKey.Price) {
      const firstPriceValue = normalizedValues[0];
      if (!isValidPriceRange(firstPriceValue)) {
        return;
      }
      filters[QueryParamsKey.Price] = [firstPriceValue];
      return;
    }

    if (!isValidFilterKey(key)) {
      return;
    }

    filters[key] = normalizedValues;
  });

  return filters;
}

export function parseFiltersFromUrlSearchParams(
  searchParams: URLSearchParams
): Record<string, string[]> {
  const filters: Record<string, string[]> = {};

  const uniqueKeys = Array.from(new Set(searchParams.keys()));

  uniqueKeys.forEach((key) => {
    const rawValues = searchParams.getAll(key);
    const normalizedValues = normalizeFilterValues(rawValues);

    if (normalizedValues.length === 0) {
      return;
    }

    if (key === QueryParamsKey.Price) {
      const firstPriceValue = normalizedValues[0];
      if (!isValidPriceRange(firstPriceValue)) {
        return;
      }
      filters[QueryParamsKey.Price] = [firstPriceValue];
      return;
    }

    if (!isValidFilterKey(key)) {
      return;
    }

    filters[key] = normalizedValues;
  });

  return filters;
}

export function parsePageParam(value: string | string[] | undefined): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function parsePriceRange(rawPriceValue: string | undefined) {
  if (!rawPriceValue) {
    return null;
  }

  const [fromRaw, toRaw] = rawPriceValue.split("-");
  const from = fromRaw === "" ? undefined : Number(fromRaw);
  const to = toRaw === "" ? undefined : Number(toRaw);

  const normalizedFrom = Number.isFinite(from) ? from : undefined;
  let normalizedTo = Number.isFinite(to) ? to : undefined;

  // Adobe product-search treats the upper bound as exclusive (< to).
  // For exact price filters (min === max), bump upper bound slightly.
  if (
    normalizedFrom !== undefined &&
    normalizedTo !== undefined &&
    normalizedFrom === normalizedTo
  ) {
    normalizedTo = Number(
      (normalizedTo + PRICE_UPPER_BOUND_INCLUSIVE_STEP).toFixed(2)
    );
  }

  if (normalizedFrom === undefined && normalizedTo === undefined) {
    return null;
  }

  return {
    from: normalizedFrom,
    to: normalizedTo,
  };
}

export function parseSortParam(
  value: string | string[] | undefined
): CategorySortKey | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) {
    return undefined;
  }

  const allowedSortValues = new Set(Object.values(CategorySortKey));
  if (!allowedSortValues.has(candidate as CategorySortKey)) {
    return undefined;
  }

  return candidate as CategorySortKey;
}

function isValidFilterKey(key: string): boolean {
  return FILTER_KEY_PATTERN.test(key) && !RESERVED_FILTER_KEYS.has(key);
}

function isValidPriceRange(value: string): boolean {
  if (!PRICE_RANGE_PATTERN.test(value)) {
    return false;
  }

  const [minValue, maxValue] = value.split("-");

  const min = minValue === "" ? null : Number(minValue);
  const max = maxValue === "" ? null : Number(maxValue);

  if (min !== null && !Number.isFinite(min)) {
    return false;
  }

  if (max !== null && !Number.isFinite(max)) {
    return false;
  }

  if (min !== null && max !== null && min > max) {
    return false;
  }

  return true;
}

function normalizeFilterValues(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeValue(value))
        .filter((value): value is string => value !== null)
    )
  );
}

function normalizeValue(value: string): null | string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
