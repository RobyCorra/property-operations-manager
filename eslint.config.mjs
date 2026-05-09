import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated files — never lint these
    "src/generated/**",
    // Non-app files (scripts, debug utilities)
    "prisma/**",
    "debug-prisma.ts",
    "scratch/**",
  ]),
  // Relax rules that are too strict for existing codebase
  {
    rules: {
      // TypeScript strict rules — too many pre-existing violations to enforce now
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      // React rules
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      // General
      "prefer-const": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
