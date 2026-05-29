import type { CodegenConfig } from "@graphql-codegen/cli";

import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ override: true, path: ".env.local" });

const url = process.env.GRAPHQL_BASE_URL;

if (!url) {
  throw new Error(
    "GRAPHQL_BASE_URL is not set. Define it in .env or .env.local"
  );
}

/**
 * Patches the introspection response so BillingCartAddress.street
 * is reported as [String]! (NON_NULL list), matching the
 * CartAddressInterface contract that the upstream schema violates.
 */
async function patchedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);

  if (!response.ok) {
    return response;
  }

  const json = await response.json();
  const types = json?.data?.__schema?.types;

  if (Array.isArray(types)) {
    const billing = types.find(
      (t: { name?: string }) => t?.name === "BillingCartAddress"
    );
    const street = billing?.fields?.find(
      (f: { name?: string }) => f?.name === "street"
    );

    if (street && street.type?.kind !== "NON_NULL") {
      street.type = {
        kind: "NON_NULL",
        name: null,
        ofType: street.type,
      };
      console.info("[codegen] Patched BillingCartAddress.street -> [String]!");
    }
  }

  return new Response(JSON.stringify(json), {
    headers: { "Content-Type": "application/json" },
    status: response.status,
    statusText: response.statusText,
  });
}

const config: CodegenConfig = {
  documents: ["src/lib/constants/api/graphql/**/*.ts"],
  generates: {
    "./schema.graphql": {
      config: {
        includeDirectives: true,
      },
      plugins: ["schema-ast"],
    },
    "./src/graphql/": {
      config: {
        documentMode: "string",
        errorType: "Error",
        maybeValue: "T | null | undefined",
      },
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
  ignoreNoDocuments: true,
  schema: {
    [url]: {
      customFetch: patchedFetch,
    },
  },
};

export default config;
