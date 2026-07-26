import "server-only";

import { Agent } from "undici";

import { STOREFRONT_API_ALLOW_INSECURE_TLS } from "@/lib/config/server-env";

type StorefrontTlsOptions = {
  dispatcher?: Agent;
};

let insecureDispatcher: Agent;

export function getStorefrontTlsOptions(): StorefrontTlsOptions {
  if (!STOREFRONT_API_ALLOW_INSECURE_TLS) {
    return {};
  }

  return {
    dispatcher: getInsecureDispatcher(),
  };
}

function getInsecureDispatcher() {
  if (!insecureDispatcher) {
    insecureDispatcher = new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    });
  }

  return insecureDispatcher;
}
