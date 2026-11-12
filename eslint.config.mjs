import { createNodeConfig } from './packages/eslint-config/node.mjs';

export default [
  {
    name: 'excel-dashboard/root-ignores',
    ignores: ['apps/**', 'packages/**', 'infrastructure/**', 'docs/**'],
  },
  ...createNodeConfig({
    tsconfigRootDir: import.meta.dirname,
    typeAware: false,
    workspaceType: 'library',
  }),
];
