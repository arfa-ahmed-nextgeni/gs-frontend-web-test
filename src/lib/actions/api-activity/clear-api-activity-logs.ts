"use server";

import { refresh } from "next/cache";

import {
  getApiActivityAvailability,
  isApiActivityAuthenticated,
} from "@/lib/api-activity/api-activity-auth";
import { clearApiActivityEntries } from "@/lib/api-activity/api-activity-store";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

export async function clearApiActivityLogs() {
  const availability = getApiActivityAvailability();

  if (!availability.available) {
    return failure("This tool is currently unavailable.");
  }

  if (!(await isApiActivityAuthenticated())) {
    return unauthenticated();
  }

  try {
    await clearApiActivityEntries();
    refresh();
  } catch (error) {
    console.error("[api-activity] Failed to clear activity logs.", error);
    return failure("Failed to clear activity logs.");
  }

  return ok({ cleared: true });
}
