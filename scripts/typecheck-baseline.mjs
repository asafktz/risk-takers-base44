import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const baselineUrl = new URL('../config/typecheck-baseline.json', import.meta.url);

export function countDiagnostics(output) {
  const counts = {};
  const pattern = /^(.+)\(\d+,\d+\): error (TS\d+):/gm;
  for (const match of output.matchAll(pattern)) {
    const key = `${match[1]}|${match[2]}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

export function findRegressions(actual, allowed) {
  return Object.entries(actual)
    .filter(([key, count]) => count > (allowed[key] || 0))
    .map(([key, count]) => ({
      key,
      count,
      allowed: allowed[key] || 0,
      added: count - (allowed[key] || 0),
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function total(counts) {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

function run() {
  const baseline = JSON.parse(readFileSync(baselineUrl, 'utf8'));
  const tscPath = require.resolve('typescript/bin/tsc');
  const result = spawnSync(
    process.execPath,
    [tscPath, '-p', './jsconfig.json', '--pretty', 'false'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  if (result.error) {
    console.error(`Unable to run TypeScript: ${result.error.message}`);
    process.exit(1);
  }

  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const actual = countDiagnostics(output);
  const actualTotal = total(actual);

  if (result.status !== 0 && actualTotal === 0) {
    console.error(output.trim() || `TypeScript exited with status ${result.status}.`);
    process.exit(result.status || 1);
  }

  const regressions = findRegressions(actual, baseline.allowed);
  if (regressions.length > 0) {
    console.error(`Typecheck regression: ${actualTotal} total diagnostics; ${regressions.reduce((sum, item) => sum + item.added, 0)} above baseline.`);
    for (const item of regressions) {
      console.error(`- ${item.key}: ${item.count} current, ${item.allowed} allowed (+${item.added})`);
    }
    process.exit(1);
  }

  const removed = Math.max(0, baseline.meta.total - actualTotal);
  console.log(`Typecheck baseline guard passed: ${actualTotal} known diagnostics, 0 new${removed ? `, ${removed} removed` : ''}.`);
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) run();
