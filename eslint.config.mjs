import stylistic from "@stylistic/eslint-plugin";
import pluginQuery from "@tanstack/eslint-plugin-query";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = [
  {
    ignores: ["**/messages/**/*.json"],
  },
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // GraphQL codegen outputs
    "src/graphql/**",
    "src/catalog-service-graphql/**",
    // Vendor scripts (New Relic, etc.)
    "public/scripts/**",
  ]),
  eslintPluginPrettierRecommended,
  perfectionist.configs["recommended-alphabetical"],
  {
    plugins: {
      "@stylistic": stylistic,
      "@tanstack/query": pluginQuery,
      import: importPlugin,
      unicorn,
    },
    rules: {
      // Disable spacing conflicts around directives entirely
      // We allow either presence or absence of a blank line after directives to avoid circular fixes
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "any", next: "expression", prev: "directive" },
        { blankLine: "any", next: "directive", prev: "directive" },
      ],
      "@tanstack/query/exhaustive-deps": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "import/first": "error",
      "import/newline-after-import": [
        "error",
        {
          considerComments: true,
          count: 1,
          exactCount: true,
        },
      ],
      // Ensure the deprecated core rule is off if inherited anywhere
      "lines-around-directive": "off",
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
      "no-debugger": "error",
      "no-restricted-imports": [
        "error",
        {
          message: "Please import from `@/i18n/navigation` instead.",
          name: "next/link",
        },
        {
          importNames: [
            "redirect",
            "permanentRedirect",
            "useRouter",
            "usePathname",
          ],
          message: "Please import from `@/i18n/navigation` instead.",
          name: "next/navigation",
        },
      ],
      "perfectionist/sort-imports": [
        "error",
        {
          customGroups: [
            {
              elementNamePattern: ["^react$", "^react-+"],
              groupName: "react",
            },
            {
              elementNamePattern: ["^next$", "^next/+"],
              groupName: "next",
            },
          ],
          groups: [
            "side-effect",
            "type-import",
            "react",
            "next",
            "value-builtin",
            "value-external",
            "value-internal",
            ["value-parent", "value-sibling", "value-index"],
            ["type-internal", "type-parent", "type-sibling", "type-index"],
            "ts-equals-import",
            "side-effect-style",
            "style",
            "unknown",
          ],
        },
      ],
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
    },
  },
  {
    files: ["**/messages/**/*.json"],
    rules: {
      "perfectionist/sort-object-types": "off",
      "prettier/prettier": "off",
    },
  },
  // Final overrides to ensure rule precedence (prevents re-enabling from shared configs)
  {
    files: [
      "**/*.{js,jsx,ts,tsx}",
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
    ],
    rules: {
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "any", next: "expression", prev: "directive" },
        { blankLine: "any", next: "directive", prev: "directive" },
      ],
      "lines-around-directive": "off",
    },
  },
];

export default defineConfig(eslintConfig);
