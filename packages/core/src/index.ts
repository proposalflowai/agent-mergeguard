import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export type Severity = "low" | "medium" | "high" | "critical";

export interface Rule {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  remediation: string;
  run(context: RuleContext): Finding[];
}

export interface ScannedFile {
  path: string;
  absolutePath: string;
  content: string;
}

export interface RuleContext {
  targetPath: string;
  files: ScannedFile[];
}

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  message: string;
  file: string;
  line: number;
}

export interface ScanInput {
  targetPath: string;
  rules?: Rule[];
}

export interface ScanResult {
  targetPath: string;
  ruleCount: number;
  fileCount: number;
  findings: Finding[];
  summary: string;
}

const ignoredDirectories = new Set([".git", "node_modules", "dist", ".turbo", "coverage"]);

export function scan(input: ScanInput): ScanResult {
  const ruleCount = input.rules?.length ?? 0;
  const files = discoverFiles(input.targetPath);
  const context: RuleContext = {
    targetPath: input.targetPath,
    files
  };
  const findings = input.rules?.flatMap((rule) => rule.run(context)) ?? [];

  return {
    targetPath: input.targetPath,
    ruleCount,
    fileCount: files.length,
    findings,
    summary: `AgentMergeGuard scan completed for ${input.targetPath}: ${findings.length} finding(s) from ${ruleCount} rule(s).`
  };
}

export function discoverFiles(targetPath: string): ScannedFile[] {
  const root = path.resolve(targetPath);

  if (!existsSync(root)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }

  const targetStat = statSync(root);
  const absolutePaths = targetStat.isDirectory() ? walkDirectory(root) : [root];

  return absolutePaths.map((absolutePath) => ({
    path: normalizePath(path.relative(root, absolutePath) || path.basename(absolutePath)),
    absolutePath,
    content: readFileSync(absolutePath, "utf8")
  }));
}

export function lineNumberForIndex(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

export function lineNumberForPattern(content: string, pattern: RegExp): number {
  const match = pattern.exec(content);
  return match ? lineNumberForIndex(content, match.index) : 1;
}

function walkDirectory(root: string): string[] {
  const entries = readdirSyncSorted(root);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(root, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...walkDirectory(absolutePath));
      }
      continue;
    }

    if (stats.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function readdirSyncSorted(directory: string): string[] {
  return readdirSync(directory).sort((left, right) => left.localeCompare(right));
}

function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}
