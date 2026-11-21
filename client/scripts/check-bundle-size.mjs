// Fails the build if any JS file grows past its gzip budget, so bundle bloat
// is caught in CI instead of in production.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const DIR = 'dist/assets';
const BUDGET_KB = { entry: 180, chunk: 60, markdown: 45 };

let failed = false;
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.js'))) {
  const kb = gzipSync(readFileSync(join(DIR, file))).length / 1024;
  const limit = file.startsWith('index-') && kb > BUDGET_KB.chunk ? BUDGET_KB.entry
    : file.startsWith('Markdown-') ? BUDGET_KB.markdown : BUDGET_KB.chunk;
  if (kb > limit) {
    console.error(`Over budget: ${file} is ${kb.toFixed(1)} kB gzip (limit ${limit} kB)`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('Bundle size within budget.');
