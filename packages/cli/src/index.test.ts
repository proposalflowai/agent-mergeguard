import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@agent-mergeguard/core", async () => import("../../core/src/index"));
vi.mock("@agent-mergeguard/rules", async () => import("../../rules/src/index"));

const repoRoot = path.resolve(".");
let runCli: typeof import("./index").runCli;

beforeAll(async () => {
  runCli = (await import("./index")).runCli;
});

function run(args: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCode = runCli(args, {
    cwd: repoRoot,
    stdout: (message) => stdout.push(message),
    stderr: (message) => stderr.push(message)
  });

  return {
    exitCode,
    stdout: stdout.join("\n"),
    stderr: stderr.join("\n")
  };
}

describe("runCli scan", () => {
  it("excludes risky fixtures by default when scanning the repository root", () => {
    const result = run(["scan", "."]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("AgentMergeGuard scan report");
    expect(result.stdout).toContain("Findings shown: 0");
    expect(result.stdout).not.toContain("Risky package lifecycle script");
  });

  it("includes fixtures intentionally", () => {
    const result = run(["scan", ".", "--include-fixtures"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Risky package lifecycle script");
    expect(result.stdout).toContain("GitHub Actions write-all permissions");
  });

  it("prints valid JSON", () => {
    const result = run(["scan", ".", "--format", "json"]);
    const parsed = JSON.parse(result.stdout) as { findings: unknown[]; minSeverity: string };

    expect(result.exitCode).toBe(0);
    expect(parsed.findings).toEqual([]);
    expect(parsed.minSeverity).toBe("low");
  });

  it("prints a readable Markdown report", () => {
    const result = run(["scan", "fixtures/risky", "--format", "markdown", "--min-severity", "high"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("# AgentMergeGuard Scan Report");
    expect(result.stdout).toContain("| Severity | Rule | Location | Message |");
    expect(result.stdout).toContain("amg.package.lifecycle-script");
  });

  it("only shows findings at or above the selected severity", () => {
    const result = run(["scan", "fixtures/risky", "--min-severity", "high"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Risky package lifecycle script");
    expect(result.stdout).not.toContain("Agent instruction discourages tests");
  });

  it("supports repeated excludes", () => {
    const result = run([
      "scan",
      "fixtures/risky",
      "--exclude",
      "package-lifecycle",
      "--exclude",
      "github-actions"
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain("Risky package lifecycle script");
    expect(result.stdout).not.toContain("GitHub Actions write-all permissions");
    expect(result.stdout).toContain("Agent instruction discourages tests");
  });
});
