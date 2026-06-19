import { describe, expect, it } from "vitest";
import { discoverFiles, scan } from "./index";

describe("scan", () => {
  it("runs rules against discovered files", () => {
    const result = scan({
      targetPath: "fixtures/safe/package-lifecycle",
      rules: [
        {
          id: "test-rule",
          title: "Test rule",
          severity: "low",
          description: "Placeholder test rule.",
          remediation: "No action required.",
          run: (context) =>
            context.files.map((file) => ({
              ruleId: "test-rule",
              title: "Test rule",
              severity: "low",
              message: "Test finding.",
              file: file.path,
              line: 1
            }))
        }
      ]
    });

    expect(result.targetPath).toBe("fixtures/safe/package-lifecycle");
    expect(result.ruleCount).toBe(1);
    expect(result.fileCount).toBe(1);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      file: "package.json",
      line: 1
    });
    expect(result.summary).toContain("scan completed");
  });

  it("discovers files under a target path", () => {
    const files = discoverFiles("fixtures/risky/github-actions");

    expect(files.map((file) => file.path)).toEqual([".github/workflows/write-all.yml"]);
    expect(files[0]?.content).toContain("permissions: write-all");
  });

  it("excludes matching paths before rules run", () => {
    const files = discoverFiles("fixtures/risky", { exclude: ["package-lifecycle", "github-actions"] });

    expect(files.map((file) => file.path)).toEqual([
      "agent-instructions/.cursor/rules/risky.mdc",
      "agent-instructions/AGENTS.md",
      "agent-instructions/CLAUDE.md",
      "README.md"
    ]);
  });
});
