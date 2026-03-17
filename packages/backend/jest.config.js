/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  // TODO: remove --passWithNoTests from the test script in package.json once backend tests exist
};

module.exports = config;
