import type { Finding, Rule, RuleContext, ScannedFile, Severity } from "../../core/src/index";
import { lineNumberForIndex, lineNumberForPattern } from "../../core/src/index";

const lifecycleScriptNames = ["preinstall", "postinstall", "prepare"] as const;
const agentInstructionFilePattern = /(^|\/)(AGENTS\.md|CLAUDE\.md|\.cursorrules|\.cursor\/rules\/[^/]+\.(md|mdc|txt))$/i;
const testSkippingPattern = /\b(skip|ignore)\s+(all\s+)?tests?\b|\bdo\s+not\s+run\s+tests?\b|\bdon't\s+run\s+tests?\b/i;

export const packageLifecycleScriptRule: Rule = {
  id: "amg.package.lifecycle-script",
  title: "Risky package lifecycle script",
  severity: "high",
  description: "Flags package.json lifecycle hooks that run automatically during install or package preparation.",
  remediation: "Review the lifecycle script before merging, and remove it unless it is clearly required and safe.",
  run(context: RuleContext): Finding[] {
    return context.files
      .filter((file) => file.path.endsWith("package.json"))
      .flatMap((file) => findRiskyLifecycleScripts(file, packageLifecycleScriptRule));
  }
};

export const githubActionsWriteAllRule: Rule = {
  id: "amg.github-actions.write-all-permissions",
  title: "GitHub Actions write-all permissions",
  severity: "high",
  description: "Flags workflows that grant write-all permissions to the GitHub token.",
  remediation: "Use the narrowest workflow permissions needed for the job.",
  run(context: RuleContext): Finding[] {
    return context.files
      .filter((file) => /(^|\/)\.github\/workflows\/[^/]+\.ya?ml$/i.test(file.path))
      .flatMap((file) => findWriteAllPermissions(file, githubActionsWriteAllRule));
  }
};

export const agentInstructionTestSkippingRule: Rule = {
  id: "amg.agent-instructions.skip-tests",
  title: "Agent instruction discourages tests",
  severity: "medium",
  description: "Flags agent instructions that tell AI coding agents to skip, ignore, or not run tests.",
  remediation: "Remove test-skipping instructions and ask agents to run the relevant checks before changes are merged.",
  run(context: RuleContext): Finding[] {
    return context.files
      .filter((file) => agentInstructionFilePattern.test(file.path))
      .flatMap((file) => findTestSkippingInstructions(file, agentInstructionTestSkippingRule));
  }
};

export const coreRules: Rule[] = [
  packageLifecycleScriptRule,
  githubActionsWriteAllRule,
  agentInstructionTestSkippingRule
];

function findRiskyLifecycleScripts(file: ScannedFile, rule: Rule): Finding[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(file.content);
  } catch {
    return [];
  }

  if (!isPackageJson(parsed)) {
    return [];
  }

  return lifecycleScriptNames
    .filter((scriptName) => typeof parsed.scripts[scriptName] === "string")
    .map((scriptName) =>
      createFinding({
        rule,
        file,
        line: lineNumberForPattern(file.content, new RegExp(`"${scriptName}"\\s*:`)),
        message: `package.json defines a ${scriptName} lifecycle script that runs automatically.`
      })
    );
}

function findWriteAllPermissions(file: ScannedFile, rule: Rule): Finding[] {
  const findings: Finding[] = [];
  const pattern = /^\s*permissions\s*:\s*write-all\s*(?:#.*)?$/gim;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(file.content)) !== null) {
    findings.push(
      createFinding({
        rule,
        file,
        line: lineNumberForIndex(file.content, match.index),
        message: "GitHub Actions workflow grants write-all token permissions."
      })
    );
  }

  return findings;
}

function findTestSkippingInstructions(file: ScannedFile, rule: Rule): Finding[] {
  const findings: Finding[] = [];
  const lines = file.content.split("\n");

  lines.forEach((line, index) => {
    if (testSkippingPattern.test(line)) {
      findings.push(
        createFinding({
          rule,
          file,
          line: index + 1,
          message: "Agent instruction tells the agent to skip or ignore tests."
        })
      );
    }
  });

  return findings;
}

function createFinding(input: {
  rule: Pick<Rule, "id" | "severity" | "title">;
  file: Pick<ScannedFile, "path">;
  line: number;
  message: string;
}): Finding {
  return {
    ruleId: input.rule.id,
    title: input.rule.title,
    severity: input.rule.severity as Severity,
    message: input.message,
    file: input.file.path,
    line: input.line
  };
}

function isPackageJson(value: unknown): value is { scripts: Record<string, unknown> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "scripts" in value &&
    typeof (value as { scripts?: unknown }).scripts === "object" &&
    (value as { scripts?: unknown }).scripts !== null
  );
}
