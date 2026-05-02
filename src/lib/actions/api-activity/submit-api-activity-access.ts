"use server";

import { revalidatePath } from "next/cache";

import {
  createApiActivitySession,
  getApiActivityAvailability,
  verifyApiActivityPassword,
} from "@/lib/api-activity/api-activity-auth";
import { ROUTES } from "@/lib/constants/routes";
import { failure, ok } from "@/lib/utils/service-result";

type ApiActivityAccessFormState = {
  errorMessage: null | string;
};

export async function submitApiActivityAccess(
  _previousState: ApiActivityAccessFormState,
  formData: FormData
): Promise<ApiActivityAccessFormState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.trim().length === 0) {
    return {
      errorMessage: "Password is required.",
    };
  }

  const result = await authenticateApiActivity(password);

  if ("error" in result) {
    return {
      errorMessage: result.error,
    };
  }

  return {
    errorMessage: null,
  };
}

async function authenticateApiActivity(password: string) {
  const availability = getApiActivityAvailability();

  if (!availability.available) {
    return failure("This tool is currently unavailable.");
  }

  if (!verifyApiActivityPassword(password)) {
    return failure("Incorrect password.");
  }

  await createApiActivitySession();
  revalidatePath(ROUTES.TOOLS.API_ACTIVITY);

  return ok({ authenticated: true });
}
