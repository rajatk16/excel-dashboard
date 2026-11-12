import {execFileSync} from 'node:child_process';

const REQUIRED_NODE_MAJOR = 24;
const REQUIRED_NPM_VERSION = [11, 6, 2];

const parseVersion = (version) => {
  const match = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Invalid version: ${version}`);
  }

  return match.slice(1).map(Number);
}

const compareVersion = (left, right) => {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] > right[index]) {
      return 1;
    }

    if (left[index] < right[index]) {
      return -1;
    }
  }

  return 0
}

const getNpmVersion = () => {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    const match = userAgent.match(/\bnpm\/(\d+\.\d+\.\d+)/);

    if (!match) {
      throw new Error(
        'This repository must be managed using npm.'
      );
    }

    return match[1];
  }

  const npmCliPath = process.env.npm_execpath;

  if (npmCliPath) {
    return execFileSync(
      process.execPath,
      [npmCliPath, '--version'],
      {
        encoding: 'utf8',
      }
    ).trim();
  }

  if (process.platform === 'win32') {
    return execFileSync(
      'cmd.exe',
      [
        '/d', '/s', '/c', 'npm --version'
      ],
      {
        encoding: 'utf8'
      }
    ).trim();
  }

  return execFileSync(
    'npm',
    ['--version'],
    {
      encoding: 'utf8'
    }
  ).trim();
}

const validateEnvironment = () => {
  const nodeVersion = process.versions.node;
  const npmVersion = getNpmVersion();

  const parsedNodeVersion = parseVersion(nodeVersion);
  const parsedNpmVersion = parseVersion(npmVersion);

  const errors = [];

  if (parsedNodeVersion[0] !== REQUIRED_NODE_MAJOR) {
    errors.push(
      `Node.js ${REQUIRED_NODE_MAJOR}.x is required. Detected ${nodeVersion}.`
    )
  }

  if (parsedNpmVersion[0] !== REQUIRED_NPM_VERSION[0] || compareVersion(parseVersion, REQUIRED_NPM_VERSION) < 0) {
    errors.push(
      `npm >=${REQUIRED_NPM_VERSION.join('.')} <12 is required. Detected ${npmVersion}.`
    )
  }

  if (errors.length > 0) {
    console.error('\nEnvironment validation failed:\n');

    for (const error of errors) {
      console.error(`  - ${error}`);
    }

    console.error(
      '\nRun "nvm install" and "nvm use" before installing dependencies.\n'
    );

    process.exitCode = 1;
    return;
  }

  console.log('\nEnvironment validation successful.');
  console.log(`  Node.js: ${nodeVersion}`);
  console.log(`  npm:     ${npmVersion}\n`);
}

try {
  validateEnvironment();
} catch (error) {
  console.error(
    'Unable to validate the development environment.'
  );

  console.error(
    error instanceof Error ? error.message : String(error)
  );

  process.exitCode = 1;
}