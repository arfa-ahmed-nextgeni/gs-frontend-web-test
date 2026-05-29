import type { CodegenConfig } from "@graphql-codegen/cli";

import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ override: true, path: ".env.local" });

const url = process.env.CATALOG_SERVICE_BASE_URL;
const environmentId = process.env.CATALOG_SERVICE_ENVIRONMENT_ID;
const apiKey = process.env.CATALOG_SERVICE_X_API_KEY;

if (!url || !environmentId || !apiKey) {
  throw new Error(
    "CATALOG_SERVICE_BASE_URL, CATALOG_SERVICE_ENVIRONMENT_ID and CATALOG_SERVICE_X_API_KEY must be set in .env or .env.local"
  );
}

const config: CodegenConfig = {
  documents: ["src/lib/constants/api/catalog-service-graphql/**/*.ts"],
  generates: {
    "./catalog-service-schema.graphql": {
      config: {
        includeDirectives: true,
      },
      plugins: ["schema-ast"],
    },
    "./src/catalog-service-graphql/": {
      config: {
        documentMode: "string",
        errorType: "Error",
        maybeValue: "T | null | undefined",
      },
      preset: "client",
    },
  },
  ignoreNoDocuments: true,
  schema: {
    [url]: {
      headers: {
        "Magento-Environment-Id": environmentId,
        "Magento-Store-Code": "main_website_store",
        "Magento-Store-View-Code": "en_sa",
        "Magento-Website-Code": "sa",
        "X-Api-Key": apiKey,
      },
    },
  },
};

export default config;
