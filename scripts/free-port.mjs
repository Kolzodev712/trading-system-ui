#!/usr/bin/env node
import { execSync } from "node:child_process";

const port = process.argv[2] ?? "5173";

try {
  execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
  console.log(`Freed port ${port}`);
} catch {
  // Port was not in use.
}
