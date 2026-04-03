export type SearchParamsRecord = Record<string, string | string[] | undefined>;
export type StringArrayRecord = Record<string, string[]>;

export function deserializeSearchParamsRecord(
  serializedSearch: string
): SearchParamsRecord {
  return JSON.parse(serializedSearch) as SearchParamsRecord;
}

export function deserializeStringArrayRecord(
  serializedRecord: string
): StringArrayRecord {
  return JSON.parse(serializedRecord) as StringArrayRecord;
}

export function serializeSearchParamsRecord(
  search: SearchParamsRecord
): string {
  const normalizedSearchParams: SearchParamsRecord = {};

  Object.keys(search)
    .sort()
    .forEach((key) => {
      const value = search[key];
      if (value === undefined) {
        return;
      }
      normalizedSearchParams[key] = Array.isArray(value) ? [...value] : value;
    });

  return JSON.stringify(normalizedSearchParams);
}

export function serializeStringArrayRecord(record: StringArrayRecord): string {
  const normalizedRecord: StringArrayRecord = {};

  Object.keys(record)
    .sort()
    .forEach((key) => {
      normalizedRecord[key] = [...record[key]];
    });

  return JSON.stringify(normalizedRecord);
}
