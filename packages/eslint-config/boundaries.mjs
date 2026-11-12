import { SOURCE_FILES } from './base.mjs';

const applicationPackages = [
  '@excel-dashboard/web',
  '@excel-dashboard/api',
  '@excel-dashboard/ingestion-worker',
  '@excel-dashboard/analytics-worker',
];

const serverOnlyPackages = [
  '@excel-dashboard/database',
  '@excel-dashboard/auth',
  '@excel-dashboard/storage',
  '@excel-dashboard/queue',
  '@excel-dashboard/logger',
  '@excel-dashboard/config',
  '@excel-dashboard/excel-parser',
  '@excel-dashboard/data-profiler',
  '@excel-dashboard/analytics-engine',
  '@excel-dashboard/query-engine',
];

const validWorkspaceTypes = new Set(['web', 'server', 'library', 'browser-library']);

/**
 * Restricts imports based on the workspace's
 * architectural responsibility.
 *
 * @param {object} options
 * @param {'web' | 'server' | 'library' | 'browser-library'} options.workspaceType
 */
export function createBoundaryConfig({ workspaceType }) {
  if (!validWorkspaceTypes.has(workspaceType)) {
    throw new Error(`Unsupported workspace type: ${workspaceType}`);
  }

  const restrictedPaths = applicationPackages.map((name) => ({
    name,
    message:
      'Applications are deployment boundaries. Move reusable functionality into a shared package.',
  }));

  const restrictedPatterns = [
    {
      group: applicationPackages.map((name) => `${name}/**`),

      message: 'Do not import application internals. Use a shared package instead.',
    },

    {
      group: [
        '@excel-dashboard/*/src',
        '@excel-dashboard/*/src/**',
        '@excel-dashboard/*/dist',
        '@excel-dashboard/*/dist/**',
      ],

      message:
        'Use the public package exports instead of importing internal source or build files.',
    },

    {
      group: [
        '**/apps/web/**',
        '**/apps/api/**',
        '**/apps/ingestion-worker/**',
        '**/apps/analytics-worker/**',
        '**/packages/*/src/**',
      ],

      message: 'Cross-workspace imports must use the @excel-dashboard package scope.',
    },
  ];

  const browserWorkspace = workspaceType === 'web' || workspaceType === 'browser-library';

  if (browserWorkspace) {
    restrictedPaths.push(
      ...serverOnlyPackages.map((name) => ({
        name,

        message: 'Server-only packages cannot be imported into browser applications or libraries.',
      })),
    );

    restrictedPatterns.push(
      {
        group: serverOnlyPackages.map((name) => `${name}/**`),

        message: 'Server-only package imports are prohibited in browser code.',
      },

      {
        group: ['node:*'],

        message: 'Node.js built-in modules are unavailable in browser application code.',
      },
    );
  }

  return {
    name: `excel-dashboard/boundaries/${workspaceType}`,

    files: SOURCE_FILES,

    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: restrictedPaths,
          patterns: restrictedPatterns,
        },
      ],
    },
  };
}
