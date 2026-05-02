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

  clearApiActivityEntries();
  refresh();

  return ok({ cleared: true });
}
