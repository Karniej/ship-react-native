module.exports = {
  extends: ["universe/native", "universe/web"],
  ignorePatterns: ["node_modules/", "convex/_generated/", "packages/system/"],
  plugins: ["import"],
  rules: {
    // Import sorting and organization
    "import/order": [
      "error",
      {
        groups: [
          "builtin", // Node.js built-in modules
          "external", // npm packages
          "internal", // Internal aliases (@/)
          "parent", // Parent imports (..)
          "sibling", // Sibling imports (.)
          "index", // Index imports
          "type", // Type imports
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "builtin",
            position: "before",
          },
          {
            pattern: "react-native",
            group: "builtin",
            position: "before",
          },
          {
            pattern: "expo-*",
            group: "external",
            position: "before",
          },
          {
            pattern: "@/**",
            group: "internal",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["react", "react-native"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-duplicates": "error",
    "import/no-unresolved": "off", // TypeScript handles this

    // React hooks
    "react-hooks/exhaustive-deps": "warn",

    // General code quality
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prefer-const": "error",
    "no-unused-vars": "off", // TypeScript handles this
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["*.config.js", "babel.config.js", "metro.config.js", "scripts/**/*.js"],
      env: {
        node: true,
      },
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["**/__tests__/**/*", "**/*.test.*"],
      rules: {
        "no-console": "off",
      },
    },
  ],
};
