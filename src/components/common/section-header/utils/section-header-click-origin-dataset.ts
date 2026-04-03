export type SectionHeaderClickOriginProps = {
  lpColumn?: number;
  lpExtra?: Record<string, unknown>;
  lpRow?: number;
};

export function parseSectionHeaderClickOrigin(
  serializedClickOrigin: null | string
): null | SectionHeaderClickOriginProps {
  if (!serializedClickOrigin) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      serializedClickOrigin
    ) as null | SectionHeaderClickOriginProps;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function serializeSectionHeaderClickOrigin({
  lpColumn,
  lpExtra,
  lpRow,
}: SectionHeaderClickOriginProps) {
  if (lpRow === undefined || lpColumn === undefined) {
    return undefined;
  }

  return JSON.stringify({
    lpColumn,
    lpExtra,
    lpRow,
  });
}
