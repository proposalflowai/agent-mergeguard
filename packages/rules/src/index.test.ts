import { describe, expect, it } from "vitest";
import { scan } from "../../core/src/index";
import {
  agentInstructionTestSkippingRule,
  coreRules,
  githubActionsWriteAllRule,
  packageLifecycleScriptRule
} from "./index";

describe("packageLifecycleScriptRule", () => {
  it("flags risky package.json lifecycle scripts", () => {
    const result = scan({
      targetPath: "fixtures/risky/package-lifecycle",
      rules: [packageLifecycleScriptRule]
    });

    expect(result.findings).toHaveLength(3);
    expect(result.findings.map((finding) => finding.message)).toEqual([
      "package.json defines a preinstall lifecycle script that runs automatically.",
      "package.json defines a postinstall lifecycle script that runs automatically.",
      "package.json defines a prepare lifecycle script that runs automatically."
    ]);
    expect(result.findings.every((finding) => finding.file === "package.json")).toBe(true);
    expect(result.findings.every((finding) => finding.line > 0)).toBe(true);
  });

  it("does not flag ordinary package scripts", () => {
    const result = scan({
      targetPath: "fixtures/safe/package-lifecycle",
      rules: [packageLifecycleScriptRule]
    });

    expect(result.findings).toEqual([]);
  });
});

describe("githubActionsWriteAllRule", () => {
  it("flags workflows with write-all permissions", () => {
    const result = scan({
      targetPath: "fixtures/risky/github-actions",
      rules: [githubActionsWriteAllRule]
    });

    expect(result.findings).toEqual([
      expect.objectContaining({
        ruleId: "amg.github-actions.write-all-permissions",
        file: ".github/workflows/write-all.yml",
        line: 5
      })
    ]);
  });

  it("does not flag read-all workflow permissions", () => {
    const result = scan({
      targetPath: "fixtures/safe/github-actions",
      rules: [githubActionsWriteAllRule]
    });

    expect(result.findings).toEqual([]);
  });
});

describe("agentInstructionTestSkippingRule", () => {
  it("flags agent instructions that discourage tests", () => {
    const result = scan({
      targetPath: "fixtures/risky/agent-instructions",
      rules: [agentInstructionTestSkippingRule]
    });

    expect(result.findings).toHaveLength(3);
    expect(result.findings.map((finding) => finding.file)).toEqual([
      ".cursor/rules/risky.mdc",
      "AGENTS.md",
      "CLAUDE.md"
    ]);
    expect(result.findings.every((finding) => finding.line === 3)).toBe(true);
  });

  it("does not flag agent instructions that ask for tests", () => {
    const result = scan({
      targetPath: "fixtures/safe/agent-instructions",
      rules: [agentInstructionTestSkippingRule]
    });

    expect(result.findings).toEqual([]);
  });
});

describe("coreRules", () => {
  it("runs the MVP rules together", () => {
    const result = scan({
      targetPath: "fixtures/risky",
      rules: coreRules
    });

    expect(result.findings).toHaveLength(7);
    expect(new Set(result.findings.map((finding) => finding.ruleId))).toEqual(
      new Set([
        "amg.package.lifecycle-script",
        "amg.github-actions.write-all-permissions",
        "amg.agent-instructions.skip-tests"
      ])
    );
  });
});
