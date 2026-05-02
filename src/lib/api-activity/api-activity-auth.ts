import "server-only";

import { cookies } from "next/headers";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import {
  getApiActivityCookieMaxAgeSeconds,
  getApiActivityFeatureState,
} from "@/lib/api-activity/api-activity-config";
import { CookieName } from "@/lib/constants/cookies";

const API_ACTIVITY_SESSION_VERSION = 1;

export async function clearApiActivitySession() {
  (await cookies()).delete({
    name: CookieName.API_ACTIVITY_SESSION,
    path: "/",
  });
}

export async function createApiActivitySession() {
  const maxAgeSeconds = getApiActivityCookieMaxAgeSeconds();
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload = encodePayload({
    exp: nowInSeconds + maxAgeSeconds,
    iat: nowInSeconds,
    v: API_ACTIVITY_SESSION_VERSION,
  });
  const signature = getSignature(payload);

  (await cookies()).set(
    CookieName.API_ACTIVITY_SESSION,
    `${payload}.${signature}`,
    getCookieOptions(maxAgeSeconds)
  );
}

export function getApiActivityAvailability() {
  const featureState = getApiActivityFeatureState();

  return {
    available: featureState.available,
    enabled: featureState.enabled,
    passwordConfigured: featureState.passwordConfigured,
  };
}

export async function getApiActivitySessionKey() {
  const cookieValue = await getApiActivitySessionValue();

  if (!cookieValue) {
    return null;
  }

  return createHash("sha256").update(cookieValue).digest("hex");
}

export async function isApiActivityAuthenticated() {
  const { available } = getApiActivityFeatureState();

  if (!available) {
    return false;
  }

  const cookieValue = await getApiActivitySessionValue();

  if (!cookieValue) {
    return false;
  }

  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = getSignature(payload);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8")
    )
  ) {
    return false;
  }

  const decodedPayload = decodePayload(payload);

  if (
    !decodedPayload ||
    decodedPayload.v !== API_ACTIVITY_SESSION_VERSION ||
    typeof decodedPayload.exp !== "number"
  ) {
    return false;
  }

  return decodedPayload.exp * 1000 > Date.now();
}

export function verifyApiActivityPassword(value: string) {
  const { available, passwordValue } = getApiActivityFeatureState();

  if (!available) {
    return false;
  }

  return timingSafeEqual(
    getPasswordDigest(value),
    getPasswordDigest(passwordValue)
  );
}

function decodePayload(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      exp?: number;
      iat?: number;
      v?: number;
    };
  } catch {
    return null;
  }
}

function encodePayload(payload: object) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

async function getApiActivitySessionValue() {
  return (await cookies()).get(CookieName.API_ACTIVITY_SESSION)?.value ?? null;
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function getPasswordDigest(value: string) {
  return createHash("sha256").update(value).digest();
}

function getSignature(payload: string) {
  const { passwordValue } = getApiActivityFeatureState();

  return createHmac("sha256", passwordValue)
    .update(payload)
    .digest("base64url");
}
