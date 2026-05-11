/**
 * @file jest.config.js
 * @description Centralized Jest configuration for the Organia Frontend.
 * 
 * This configuration integrates with Next.js (next/jest) and defines
 * environmental settings, path mappings, and coverage thresholds.
 */

const nextJest = require("next/jest.js");

const createJestConfig = nextJest({
  /**
   * Path to your Next.js app root to load next.config.js and .env files.
   */
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  /**
   * Use jsdom to provide a browser-like environment for DOM testing.
   */
  testEnvironment: "jsdom",

  /**
   * Scripts to run before every test suite.
   */
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  /**
   * Aliases to resolve @/ paths to the src directory.
   */
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  /**
   * Patterns to identify test files.
   */
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  /**
   * Defines which files should be tracked for coverage reports.
   */
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/types/**",
  ],

  /**
   * Enforcement thresholds for code coverage.
   * Ensures that PRs maintain a baseline level of testing.
   */
  coverageThreshold: {
    global: {
      branches  : 20,
      functions : 20,
      lines     : 25,
      statements: 25,
    },
  },
};

module.exports = createJestConfig(config);
