export type Severity = "low" | "medium" | "high" | "critical";

export interface Rule {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  remediation: string;
}

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
}

export interface ScanInput {
  targetPath: string;
  rules?: Rule[];
}

export interface ScanResult {
  targetPath: string;
  ruleCount: number;
  findings: Finding[];
  summary: string;
}

export function scan(input: ScanInput): ScanResult {
  const ruleCount = input.rules?.length ?? 0;

  return {
    targetPath: input.targetPath,
    ruleCount,
    findings: [],
    summary: `AgentMergeGuard placeholder scan completed for ${input.targetPath} using ${ruleCount} rule(s).`
  };
}
