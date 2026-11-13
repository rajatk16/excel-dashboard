import { createReactConfig } from '@excel-dashboard/eslint-config/react';

export default createReactConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: true,
  fastRefresh: false,
  workspaceType: 'browser-library',
});
