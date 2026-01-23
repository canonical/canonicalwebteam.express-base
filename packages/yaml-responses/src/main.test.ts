import { expect, test } from "vitest";
import { mul } from "./main.js";

test("multiplies two numbers", () => {
  expect(mul(4, 7)).toBe(28);
});
