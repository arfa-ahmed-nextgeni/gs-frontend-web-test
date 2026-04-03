import type { CodegenConfig } from "@graphql-codegen/cli";

import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

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
    [process.env.CATALOG_SERVICE_BASE_URL!]: {
      headers: {
        "Magento-Environment-Id": process.env.CATALOG_SERVICE_ENVIRONMENT_ID!,
        "Magento-Store-Code": "main_website_store",
        "Magento-Store-View-Code": "en_sa",
        "Magento-Website-Code": "sa",
        "X-Api-Key": process.env.CATALOG_SERVICE_X_API_KEY!,
      },
    },
  },
};

export default config;
