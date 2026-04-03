"use server";

import { cache } from "react";

import { getCookie } from "@/lib/actions/cookies";
import { CookieName } from "@/lib/constants/cookies";

export const getAuthToken = cache(async () => {
  const token = await getCookie(CookieName.AUTH_TOKEN);

  return token;
});
