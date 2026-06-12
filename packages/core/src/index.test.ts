import { describe, expect, it } from "vitest";
import { scan } from "./index";

describe("scan", () => {
  it("returns a placeholder scan result", () => {
    const result = scan({
      targetPath: ".",
      rules: [
        {
          id: "test-rule",
          title: "Test rule",
          severity: "low",
          description: "Placeholder test rule.",
          remediation: "No action required."
        }
      ]
    });

    expect(result.targetPath).toBe(".");
    expect(result.ruleCount).toBe(1);
    expect(result.findings).toEqual([]);
    expect(result.summary).toContain("placeholder scan completed");
  });
});
