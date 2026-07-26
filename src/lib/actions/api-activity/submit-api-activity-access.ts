/* eslint-disable no-restricted-imports -- Standalone tools route has no next-intl context. */
"use server";

import { redirect } from "next/navigation";

import {
  createApiActivitySession,
  getApiActivityAvailability,
  verifyApiActivityPassword,
} from "@/lib/api-activity/api-activity-auth";
import { ROUTES } from "@/lib/constants/routes";

type ApiActivityAccessFormState = {
  errorMessage: null | string;
};

export async function submitApiActivityAccess(
  _previousState: ApiActivityAccessFormState,
  formData: FormData
): Promise<ApiActivityAccessFormState> {
  const redirectTo = getRedirectTo(formData);
  const password = formData.get("password");

  if (typeof password !== "string" || password.trim().length === 0) {
    return {
      errorMessage: "Password is required.",
    };
  }

  const availability = getApiActivityAvailability();

  if (!availability.available) {
    return {
      errorMessage: "This tool is currently unavailable.",
    };
  }

  if (!verifyApiActivityPassword(password)) {
    return {
      errorMessage: "Incorrect password.",
    };
  }

  await createApiActivitySession();
  redirect(redirectTo);
}

function getRedirectTo(formData: FormData) {
  const redirectTo = formData.get("redirectTo");

  if (typeof redirectTo === "string" && isAllowedToolRedirectPath(redirectTo)) {
    return redirectTo;
  }

  return ROUTES.TOOLS.API_ACTIVITY;
}

function isAllowedToolRedirectPath(path: string) {
  return (
    path === ROUTES.TOOLS.API_ACTIVITY || path === ROUTES.TOOLS.CACHE_REVALIDATE
  );
}
