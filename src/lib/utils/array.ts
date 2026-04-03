export function arraysEqual<T extends boolean | number | string>(
  arr1: T[],
  arr2: T[]
): boolean {
  if (arr1.length !== arr2.length) return false;

  const count1: Record<string, number> = {};
  const count2: Record<string, number> = {};

  for (const item of arr1) {
    const key = String(item);
    count1[key] = (count1[key] || 0) + 1;
  }

  for (const item of arr2) {
    const key = String(item);
    count2[key] = (count2[key] || 0) + 1;
  }

  for (const key in count1) {
    if (count1[key] !== count2[key]) return false;
  }

  return true;
}
