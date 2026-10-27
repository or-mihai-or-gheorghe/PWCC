const js = require("@eslint/js");
const globals = require("globals");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  {
    files: ["**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      eqeqeq: "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
]);
