#!/usr/bin/env node
import { scan } from "@agent-mergeguard/core";
import { coreRules } from "@agent-mergeguard/rules";

function printHelp(): void {
  console.log(`AgentMergeGuard

Usage:
  agent-mergeguard scan [path] [--format json]

Examples:
  agent-mergeguard scan .
  agent-mergeguard scan . --format json
`);
}

function main(argv: string[]): void {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  const [command, maybePath, ...rest] = args;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command !== "scan") {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  const targetPath = maybePath && !maybePath.startsWith("--") ? maybePath : ".";
  const format = rest.includes("--format") ? rest[rest.indexOf("--format") + 1] : undefined;
  const result = scan({ targetPath, rules: coreRules });

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("AgentMergeGuard placeholder scan");
  console.log(`Target: ${result.targetPath}`);
  console.log(`Rules loaded: ${result.ruleCount}`);
  console.log(`Findings: ${result.findings.length}`);
  console.log(result.summary);
}

main(process.argv.slice(2));
