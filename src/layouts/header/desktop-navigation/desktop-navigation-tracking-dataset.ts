import type { DesktopNavigationUrlType } from "@/lib/analytics/models/event-models";

export type DesktopNavigationTrackingPayload = {
  categoryId?: string;
  categoryMeta?: {
    "category.id": string;
    "category.name": string;
  };
  lpId: string;
  lpName: string;
  position: number;
  title: string;
  urlType: DesktopNavigationUrlType;
};

export function parseDesktopNavigationTrackingPayload(
  serializedTrackingPayload: null | string
): DesktopNavigationTrackingPayload | null {
  if (!serializedTrackingPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      serializedTrackingPayload
    ) as DesktopNavigationTrackingPayload | null;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.lpId !== "string" ||
      typeof parsed.lpName !== "string" ||
      typeof parsed.position !== "number" ||
      typeof parsed.title !== "string" ||
      (parsed.urlType !== "brands" &&
        parsed.urlType !== "category" &&
        parsed.urlType !== "lp")
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function serializeDesktopNavigationTrackingPayload(
  payload: DesktopNavigationTrackingPayload
) {
  return JSON.stringify(payload);
}
