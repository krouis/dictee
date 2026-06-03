import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const testBuildDir = path.join(root, '.test-build');

async function findCompiledTests(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findCompiledTests(fullPath);
    return entry.name.endsWith('.test.js') ? [fullPath] : [];
  }));
  return files.flat();
}

const testFiles = await findCompiledTests(testBuildDir);

if (testFiles.length === 0) {
  console.error('No compiled test files found in .test-build.');
  process.exit(1);
}

const child = spawn(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Test runner exited with signal ${signal}.`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
