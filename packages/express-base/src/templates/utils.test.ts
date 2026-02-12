import { describe, expect, it } from "vitest";
import { formatJson } from "./utils.js";

describe("formatJson", () => {
  it("should format object with indentation", () => {
    const result = formatJson({ foo: "bar", baz: 123 });

    expect(result).toContain('"foo": "bar"');
    expect(result).toContain('"baz": 123');
    expect(result).toContain("\n");
  });

  it("should handle circular references gracefully", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const result = formatJson(circular);
    expect(typeof result).toBe("string");
  });

  it("should handle primitives", () => {
    expect(formatJson(null)).toBe("null");
    expect(formatJson(42)).toBe("42");
    expect(formatJson("hello")).toBe('"hello"');
  });
});
