import { expect, test } from "vitest";
import { sub } from "./main.js";

test("subtracts two numbers", () => {
  expect(sub(10, 7)).toBe(3);
});
