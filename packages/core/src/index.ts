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
  exclude?: string[];
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
  const files = discoverFiles(input.targetPath, { exclude: input.exclude });
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

export function discoverFiles(targetPath: string, options: { exclude?: string[] } = {}): ScannedFile[] {
  const root = path.resolve(targetPath);

  if (!existsSync(root)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }

  const targetStat = statSync(root);
  const excludeMatchers = (options.exclude ?? []).map(createExcludeMatcher);
  const absolutePaths = targetStat.isDirectory()
    ? walkDirectory(root, root, excludeMatchers)
    : [root].filter((absolutePath) => !isExcluded(root, absolutePath, excludeMatchers));

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

function walkDirectory(directory: string, root: string, excludeMatchers: ExcludeMatcher[]): string[] {
  const entries = readdirSyncSorted(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);

    if (isExcluded(root, absolutePath, excludeMatchers)) {
      continue;
    }

    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...walkDirectory(absolutePath, root, excludeMatchers));
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

type ExcludeMatcher = {
  normalized: string;
  pattern?: RegExp;
};

function createExcludeMatcher(rawExclude: string): ExcludeMatcher {
  const normalized = normalizePath(rawExclude.trim()).replace(/^\.?\//, "").replace(/\/+$/, "");
  const hasWildcard = normalized.includes("*");

  return {
    normalized,
    pattern: hasWildcard ? new RegExp(`^${escapeGlob(normalized)}(?:/.*)?$`) : undefined
  };
}

function isExcluded(root: string, absolutePath: string, excludeMatchers: ExcludeMatcher[]): boolean {
  if (excludeMatchers.length === 0) {
    return false;
  }

  const relativePath = normalizePath(path.relative(root, absolutePath) || path.basename(absolutePath));
  const segments = relativePath.split("/");

  return excludeMatchers.some((matcher) => {
    if (!matcher.normalized) {
      return false;
    }

    if (matcher.pattern) {
      return matcher.pattern.test(relativePath);
    }

    return (
      relativePath === matcher.normalized ||
      relativePath.startsWith(`${matcher.normalized}/`) ||
      segments.includes(matcher.normalized)
    );
  });
}

function escapeGlob(glob: string): string {
  return glob
    .split("*")
    .map((part) => part.replace(/[|\\{}()[\]^$+?.]/g, "\\$&"))
    .join("[^/]*");
}
