import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("smoke test", () => {
  it("cn() from @/lib/utils returns a string", () => {
    const result = cn("px-2", "py-1");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
