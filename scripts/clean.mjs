import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

const rootDirectory = resolve(scriptDirectory, '..');

const cleanAll = process.argv.includes('--all');

const buildDirectories = [
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.cache',
  '.vite',
  'test-results',
  'playwright-report',
];

function removePath(targetPath) {
  if (!existsSync(targetPath)) {
    return;
  }

  rmSync(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });

  console.log(`Removed ${relative(rootDirectory, targetPath)}`);
}

function getWorkspaceDirectories() {
  const workspaceDirectories = [];

  for (const parent of ['apps', 'packages']) {
    const parentDirectory = join(rootDirectory, parent);

    if (!existsSync(parentDirectory)) {
      continue;
    }

    const entries = readdirSync(parentDirectory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const workspaceDirectory = join(parentDirectory, entry.name);

      if (existsSync(join(workspaceDirectory, 'package.json'))) {
        workspaceDirectories.push(workspaceDirectory);
      }
    }
  }

  return workspaceDirectories;
}

function cleanDirectory(directory) {
  for (const buildDirectory of buildDirectories) {
    removePath(join(directory, buildDirectory));
  }

  const entries = readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.tsbuildinfo')) {
      removePath(join(directory, entry.name));
    }
  }

  if (cleanAll) {
    removePath(join(directory, 'node_modules'));
  }
}

function main() {
  console.log(
    cleanAll ? 'Cleaning build artifacts and dependencies...' : 'Cleaning build artifacts...',
  );

  const workspaces = getWorkspaceDirectories();

  for (const workspace of workspaces) {
    cleanDirectory(workspace);
  }

  cleanDirectory(rootDirectory);

  console.log('\nRepository cleanup complete.');

  if (cleanAll) {
    console.log('Run "npm ci" to reinstall dependencies.');
  }
}

try {
  main();
} catch (error) {
  console.error('Repository cleanup failed.');

  console.error(error instanceof Error ? error.message : String(error));

  process.exitCode = 1;
}
