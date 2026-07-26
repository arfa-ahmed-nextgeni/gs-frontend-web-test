import { headers } from "next/headers";

import { getForwardedRequestHeadersFrom } from "@/lib/utils/forwarded-headers";

export { getForwardedRequestHeadersFrom } from "@/lib/utils/forwarded-headers";

export async function getForwardedRequestHeaders(): Promise<Headers> {
  return getForwardedRequestHeadersFrom(await headers());
}
