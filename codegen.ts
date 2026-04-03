import type { CodegenConfig } from "@graphql-codegen/cli";

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
  schema: "./schema.graphql",
};

export default config;
