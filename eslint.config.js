import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  // Backend (Node.js) override
  {
    files: ["backend/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "script",
      },
    },
    rules: {
      // Allow unused arg names when prefixed with _ (e.g., _next)
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Be permissive in server switch-case declarations
      "no-case-declarations": "off",
    },
  },
]);
