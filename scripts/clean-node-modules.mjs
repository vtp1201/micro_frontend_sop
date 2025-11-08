import { rm, readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

async function removeIfExists(p) {
  try {
    await rm(p, { recursive: true, force: true });
    console.log('removed', p);
  } catch (e) {
    // ignore
  }
}

async function walkAndRemoveNodeModules(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules') {
        await removeIfExists(full);
        continue; // skip descending into removed node_modules
      }
      // skip .git and maybe pnpm-store folders to speed up
      if (ent.name === '.git' || ent.name === '.pnpm-store') continue;
      await walkAndRemoveNodeModules(full);
    }
  }
}

async function main() {
  try {
    console.log('→ scanning and removing node_modules (this may take a while)...');
    await walkAndRemoveNodeModules(ROOT);

    // also remove top-level node_modules if exists
    await removeIfExists(path.join(ROOT, 'node_modules'));

    // remove pnpm lockfile(s)
    await unlink(path.join(ROOT, 'pnpm-lock.yaml')).catch(() => {});
    console.log('→ removed pnpm-lock.yaml (if existed)');

    console.log('✅ done. Run `pnpm install` to reinstall dependencies.');
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

main();
