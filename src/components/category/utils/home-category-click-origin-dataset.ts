import type { LpClickOrigin } from "@/lib/analytics/models/event-models";

type HomeCategoryClickOriginProps = {
  lpColumn?: number;
  lpRow?: number;
};

export function parseHomeCategoryClickOrigin(
  serializedClickOrigin: null | string
): LpClickOrigin | null {
  if (!serializedClickOrigin) {
    return null;
  }

  try {
    const parsed = JSON.parse(serializedClickOrigin) as LpClickOrigin | null;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.origin !== "lp" ||
      typeof parsed.row !== "number" ||
      typeof parsed.column !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function serializeHomeCategoryClickOrigin({
  lpColumn,
  lpRow,
}: HomeCategoryClickOriginProps) {
  if (lpRow === undefined || lpColumn === undefined) {
    return undefined;
  }

  return JSON.stringify({
    column: lpColumn,
    extra: {
      type: "desktop-categories",
    },
    origin: "lp",
    row: lpRow,
  } satisfies LpClickOrigin);
}
