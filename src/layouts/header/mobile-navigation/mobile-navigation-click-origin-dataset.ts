type MobileNavigationClickOriginPayload = {
  position: number;
};

export function parseMobileNavigationClickOriginPayload(
  serializedPayload: null | string
): MobileNavigationClickOriginPayload | null {
  if (!serializedPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      serializedPayload
    ) as MobileNavigationClickOriginPayload | null;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.position !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function serializeMobileNavigationClickOriginPayload(
  payload: MobileNavigationClickOriginPayload
) {
  return JSON.stringify(payload);
}
