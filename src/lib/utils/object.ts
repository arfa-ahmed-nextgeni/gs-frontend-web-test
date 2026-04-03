export const getEntries = <T extends Record<string, unknown>>(object: T) =>
  Object.keys(object).map(
    (key) => [key, object[key as keyof T]] as [keyof T, T[keyof T]]
  );

export function getValues<T extends Record<string, unknown>>(
  object: T
): T[keyof T][] {
  return Object.values(object) as T[keyof T][];
}
