export function parsePositiveInteger(
  value: null | string,
  defaultValue?: number
): null | number {
  if (!value || value.trim() === "") {
    return defaultValue ?? null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}
