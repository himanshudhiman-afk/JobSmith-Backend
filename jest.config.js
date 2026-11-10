export default {
  testEnvironment: "node",
  transform: {},
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/src/__tests__/setup\\.js$", "/fixtures/"]
};
