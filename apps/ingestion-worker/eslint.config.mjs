import { createNodeConfig } from '@excel-dashboard/eslint-config/node';

export default createNodeConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: true,
  workspaceType: 'server',
});
