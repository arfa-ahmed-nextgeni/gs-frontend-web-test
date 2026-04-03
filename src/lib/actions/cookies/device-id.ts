"use server";

import { cache } from "react";

import { refresh } from "next/cache";

import { getCookie, setCookie } from "@/lib/actions/cookies";
import { CookieName } from "@/lib/constants/cookies";

export const getDeviceIdCookie = cache(async () => {
  const deviceId = await getCookie(CookieName.DEVICE_ID);

  return deviceId;
});

export async function getOrSetDeviceIdCookie(preferredDeviceId?: string) {
  const resolvedPreferredDeviceId = preferredDeviceId?.trim();
  const existingDeviceId = await getCookie(CookieName.DEVICE_ID);

  if (resolvedPreferredDeviceId) {
    if (existingDeviceId !== resolvedPreferredDeviceId) {
      await setDeviceIdCookie(resolvedPreferredDeviceId);
    }

    return resolvedPreferredDeviceId;
  }

  if (existingDeviceId) {
    return existingDeviceId;
  }
  return null;
}

export async function syncDeviceIdCookie({
  deviceId,
  shouldRefresh = false,
}: {
  deviceId: string;
  shouldRefresh?: boolean;
}) {
  const resolvedDeviceId = deviceId.trim();
  if (!resolvedDeviceId) {
    return false;
  }

  const existingDeviceId = await getCookie(CookieName.DEVICE_ID);
  if (existingDeviceId === resolvedDeviceId) {
    return false;
  }

  await setDeviceIdCookie(resolvedDeviceId);

  if (shouldRefresh) {
    refresh();
  }

  return true;
}

async function setDeviceIdCookie(deviceId: string) {
  await setCookie(CookieName.DEVICE_ID, deviceId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
