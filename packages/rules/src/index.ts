import type { Rule } from "@agent-mergeguard/core";

export const coreRules: Rule[] = [
  {
    id: "amg.placeholder.mcp-config",
    title: "Placeholder MCP config rule",
    severity: "low",
    description: "Placeholder rule for future MCP config risk detection.",
    remediation: "Replace this placeholder with a real MCP config rule."
  },
  {
    id: "amg.placeholder.agent-instructions",
    title: "Placeholder agent instruction rule",
    severity: "low",
    description: "Placeholder rule for future AGENTS.md / CLAUDE.md / Cursor rules detection.",
    remediation: "Replace this placeholder with a real agent instruction safety rule."
  }
];
