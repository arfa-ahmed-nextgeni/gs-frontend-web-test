import "server-only";

import { cache } from "react";

import { headers } from "next/headers";
import { userAgent } from "next/server";

export const getIsMobileRequest = cache(async () => {
  const { device } = userAgent({
    headers: await headers(),
  });

  return device.type === "mobile" || device.type === "tablet";
});
