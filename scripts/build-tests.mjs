import { build } from 'esbuild';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outdir = path.join(root, '.test-build');

async function findTests(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findTests(fullPath);
    return entry.name.endsWith('.test.ts') ? [fullPath] : [];
  }));
  return files.flat();
}

await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

const entryPoints = await findTests(path.join(root, 'src'));

await Promise.all(entryPoints.map((entryPoint) => {
  const relative = path.relative(path.join(root, 'src'), entryPoint).replace(/\.ts$/, '.js');
  return build({
    entryPoints: [entryPoint],
    outfile: path.join(outdir, relative),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    sourcemap: true,
  });
}));
