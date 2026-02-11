import { expect, test } from "vitest";
import { yamlRedirects } from "./main.js";

// TODO improve test
test("is an express middleware", () => {
  expect(yamlRedirects("")).toBeInstanceOf(Function);
});
