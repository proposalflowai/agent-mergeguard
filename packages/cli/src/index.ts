#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { scan, type Finding, type ScanResult, type Severity } from "@agent-mergeguard/core";
import { coreRules } from "@agent-mergeguard/rules";

type OutputFormat = "text" | "json" | "markdown";

type ScanOptions = {
  targetPath: string;
  format: OutputFormat;
  minSeverity: Severity;
  exclude: string[];
  includeFixtures: boolean;
};

type RunIo = {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
  cwd: string;
};

const severityOrder: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3
};

const defaultExcludes = ["node_modules", "dist", ".git"];
const repoRootFixtureExclude = "fixtures";

export function runCli(argv: string[], io: Partial<RunIo> = {}): number {
  const resolvedIo: RunIo = {
    stdout: io.stdout ?? console.log,
    stderr: io.stderr ?? console.error,
    cwd: io.cwd ?? process.cwd()
  };
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  const [command, ...rest] = args;

  if (!command || command === "--help" || command === "-h") {
    resolvedIo.stdout(helpText());
    return 0;
  }

  if (command !== "scan") {
    resolvedIo.stderr(`Unknown command: ${command}`);
    resolvedIo.stdout(helpText());
    return 1;
  }

  const parsed = parseScanOptions(rest);

  if (!parsed.ok) {
    resolvedIo.stderr(parsed.error);
    resolvedIo.stdout(helpText());
    return 1;
  }

  const targetPath = path.resolve(resolvedIo.cwd, parsed.options.targetPath);
  const excludes = effectiveExcludes(parsed.options, targetPath, resolvedIo.cwd);

  try {
    const result = scan({
      targetPath,
      rules: coreRules,
      exclude: excludes
    });
    const displayedFindings = filterByMinSeverity(result.findings, parsed.options.minSeverity);
    const report = { ...result, findings: displayedFindings };

    resolvedIo.stdout(renderReport(report, parsed.options.format, parsed.options.minSeverity));
    return hasBlockingFindings(result.findings) ? 1 : 0;
  } catch (error) {
    resolvedIo.stderr(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function parseScanOptions(args: string[]): { ok: true; options: ScanOptions } | { ok: false; error: string } {
  const options: ScanOptions = {
    targetPath: ".",
    format: "text",
    minSeverity: "low",
    exclude: [],
    includeFixtures: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--include-fixtures") {
      options.includeFixtures = true;
      continue;
    }

    if (arg === "--format" || arg.startsWith("--format=")) {
      const value = readOptionValue(args, index, "--format");
      if (!value) {
        return { ok: false, error: "--format requires text, json, or markdown." };
      }
      if (arg === "--format") {
        index += 1;
      }
      if (!isFormat(value)) {
        return { ok: false, error: `Unsupported format: ${value}` };
      }
      options.format = value;
      continue;
    }

    if (arg === "--min-severity" || arg.startsWith("--min-severity=")) {
      const value = readOptionValue(args, index, "--min-severity");
      if (!value) {
        return { ok: false, error: "--min-severity requires low, medium, high, or critical." };
      }
      if (arg === "--min-severity") {
        index += 1;
      }
      if (!isSeverity(value)) {
        return { ok: false, error: `Unsupported minimum severity: ${value}` };
      }
      options.minSeverity = value;
      continue;
    }

    if (arg === "--exclude" || arg.startsWith("--exclude=")) {
      const value = readOptionValue(args, index, "--exclude");
      if (!value) {
        return { ok: false, error: "--exclude requires a path or pattern." };
      }
      if (arg === "--exclude") {
        index += 1;
      }
      options.exclude.push(value);
      continue;
    }

    if (arg.startsWith("--")) {
      return { ok: false, error: `Unknown option: ${arg}` };
    }

    if (options.targetPath !== ".") {
      return { ok: false, error: `Unexpected argument: ${arg}` };
    }

    options.targetPath = arg;
  }

  return { ok: true, options };
}

function readOptionValue(args: string[], index: number, optionName: string): string | undefined {
  const arg = args[index];
  const inlinePrefix = `${optionName}=`;

  if (arg.startsWith(inlinePrefix)) {
    return arg.slice(inlinePrefix.length);
  }

  return args[index + 1];
}

function effectiveExcludes(options: ScanOptions, targetPath: string, cwd: string): string[] {
  const excludes = [...defaultExcludes, ...options.exclude];

  if (!options.includeFixtures && isRepoRootScan(targetPath, cwd)) {
    excludes.push(repoRootFixtureExclude);
  }

  return excludes;
}

function isRepoRootScan(targetPath: string, cwd: string): boolean {
  return targetPath === path.resolve(cwd) && existsSync(path.join(targetPath, "pnpm-workspace.yaml"));
}

function filterByMinSeverity(findings: Finding[], minSeverity: Severity): Finding[] {
  return findings.filter((finding) => severityOrder[finding.severity] >= severityOrder[minSeverity]);
}

function hasBlockingFindings(findings: Finding[]): boolean {
  return findings.some((finding) => finding.severity === "high" || finding.severity === "critical");
}

function renderReport(result: ScanResult, format: OutputFormat, minSeverity: Severity): string {
  if (format === "json") {
    return JSON.stringify({ ...result, minSeverity }, null, 2);
  }

  if (format === "markdown") {
    return renderMarkdownReport(result, minSeverity);
  }

  return renderTextReport(result, minSeverity);
}

function renderTextReport(result: ScanResult, minSeverity: Severity): string {
  const lines = [
    "AgentMergeGuard scan report",
    `Target: ${result.targetPath}`,
    `Files scanned: ${result.fileCount}`,
    `Rules loaded: ${result.ruleCount}`,
    `Minimum severity: ${minSeverity}`,
    `Findings shown: ${result.findings.length}`
  ];

  if (result.findings.length === 0) {
    lines.push("", "No findings matched the selected severity.");
    return lines.join("\n");
  }

  lines.push("");

  for (const finding of result.findings) {
    lines.push(
      `[${finding.severity.toUpperCase()}] ${finding.title}`,
      `Rule: ${finding.ruleId}`,
      `Location: ${finding.file}:${finding.line}`,
      finding.message,
      ""
    );
  }

  return lines.join("\n").trimEnd();
}

function renderMarkdownReport(result: ScanResult, minSeverity: Severity): string {
  const lines = [
    "# AgentMergeGuard Scan Report",
    "",
    `- Target: \`${result.targetPath}\``,
    `- Files scanned: ${result.fileCount}`,
    `- Rules loaded: ${result.ruleCount}`,
    `- Minimum severity: ${minSeverity}`,
    `- Findings shown: ${result.findings.length}`,
    ""
  ];

  if (result.findings.length === 0) {
    lines.push("No findings matched the selected severity.");
    return lines.join("\n");
  }

  lines.push("| Severity | Rule | Location | Message |", "| --- | --- | --- | --- |");

  for (const finding of result.findings) {
    lines.push(
      `| ${finding.severity} | \`${finding.ruleId}\` | \`${finding.file}:${finding.line}\` | ${escapeMarkdownTable(
        finding.message
      )} |`
    );
  }

  return lines.join("\n");
}

function escapeMarkdownTable(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function isFormat(value: string): value is OutputFormat {
  return value === "text" || value === "json" || value === "markdown";
}

function isSeverity(value: string): value is Severity {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

function helpText(): string {
  return `AgentMergeGuard

Usage:
  agent-mergeguard scan [path] [--format text|json|markdown] [--min-severity low|medium|high|critical]

Options:
  --format text|json|markdown       Report output format. Defaults to text.
  --min-severity low|medium|high|critical
                                     Only show findings at or above this severity. Defaults to low.
  --exclude <path-or-pattern>        Exclude a path from scanning. May be repeated.
  --include-fixtures                 Include repository fixtures when scanning the repo root.

Examples:
  agent-mergeguard scan .
  agent-mergeguard scan . --format json
  agent-mergeguard scan . --format markdown --min-severity high
`;
}

if (isDirectCliEntry(process.argv[1]) && !process.env.VITEST) {
  process.exitCode = runCli(process.argv.slice(2));
}

function isDirectCliEntry(entryPath: string | undefined): boolean {
  if (!entryPath || !/(?:^|[/\\])(?:dist|src)[/\\]index\.(?:js|ts)$/.test(entryPath)) {
    return false;
  }

  const packageJsonPath = path.join(path.dirname(path.resolve(entryPath)), "..", "package.json");

  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    return JSON.parse(readFileSync(packageJsonPath, "utf8")).name === "@agent-mergeguard/cli";
  } catch {
    return false;
  }
}
