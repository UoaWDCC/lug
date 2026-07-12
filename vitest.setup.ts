/* 
Global Vitest setup file.
Runs before every test suite and is used to configure
shared testing utilities, mocks, and custom matchers.
*/
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

/*
 * @testing-library/react normally auto-registers this cleanup, but only
 * if it detects a global `afterEach`. Since this project runs Vitest with
 * globals: false, that detection silently fails, so DOM from one test
 * leaks into the next. Registering it explicitly here fixes that for every
 * test file, without switching to globals: true project-wide.
 */

afterEach(() => {
  cleanup();
});
