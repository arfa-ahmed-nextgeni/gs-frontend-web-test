"use server";

import { revalidatePath } from "next/cache";

import {
  clearApiActivitySession,
  getApiActivitySessionKey,
} from "@/lib/api-activity/api-activity-auth";
import { clearCachedApiActivitySelectedEntry } from "@/lib/api-activity/api-activity-store";
import { ROUTES } from "@/lib/constants/routes";

export async function logoutApiActivity() {
  const sessionKey = await getApiActivitySessionKey();

  if (sessionKey) {
    clearCachedApiActivitySelectedEntry(sessionKey);
  }

  await clearApiActivitySession();
  revalidatePath(ROUTES.TOOLS.API_ACTIVITY);
}
