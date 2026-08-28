module.exports = {
  root: true,
  env: { node: true, es2022: true, jest: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["dist", "node_modules"],
};
