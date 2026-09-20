import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",
    
    // React rules
    "react-hooks/exhaustive-deps": "off",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",
    
    // Next.js rules
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",
    // App Router-এ layout.tsx-এ custom font লোড করা সঠিক —
    // এই rule টা Pages Router-এর জন্য, এখানে false positive
    "@next/next/no-page-custom-font": "off",
    
    // General JavaScript rules
    "prefer-const": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-debugger": "off",
    "no-empty": "off",
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "no-useless-escape": "off",
  },
}, {
  // শুধু আসল অ্যাপ সোর্স লিন্ট হবে — build artifacts/staging/sandbox dirs বাদ।
  // **/ প্যাটার্ন না দিলে nested path (যেমন stage-docker/annoor/.next) ধরা পড়ত।
  ignores: [
    "node_modules/**", "**/node_modules/**",
    ".next/**", "**/.next/**",
    "out/**", "build/**", "**/build/**", "**/dist/**",
    "next-env.d.ts", "**/next-env.d.ts",
    "examples/**", "skills/**", "scripts/**",
    "stage-docker/**", "download/**", "db/**", "docs/**", "upload/**",
    "agent-ctx/**", ".git/**", "logs/**", "*.log",
  ]
}];

export default eslintConfig;
