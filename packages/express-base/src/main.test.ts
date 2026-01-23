import { expect, test } from "vitest";
import { add } from "./main.js";

test("sums two numbers", () => {
  expect(add(4, 7)).toBe(11);
});
