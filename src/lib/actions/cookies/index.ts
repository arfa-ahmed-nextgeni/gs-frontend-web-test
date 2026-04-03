"use server";

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

import { CookieName } from "@/lib/constants/cookies";

export const getCookie = async (key: CookieName) => {
  const cookie = (await cookies()).get(key);

  if (!cookie) {
    return null;
  }

  return cookie.value;
};

export const setCookie = async (
  key: CookieName,
  value: string,
  options?: Partial<ResponseCookie>
) => {
  (await cookies()).set({
    name: key,
    value,
    ...options,
  });
};

export const deleteCookie = async (
  key: CookieName,
  options?: Omit<ResponseCookie, "expires" | "name" | "value">
) => {
  (await cookies()).delete({
    name: key,
    ...options,
  });
};
