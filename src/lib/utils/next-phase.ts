import "server-only";

import { NEXT_PHASE } from "@/lib/config/server-env";

export function isProductionBuild() {
  return NEXT_PHASE === "phase-production-build";
}
