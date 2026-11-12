import { createNodeConfig } from './node.mjs';

export default createNodeConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: false,
  workspaceType: 'library',
});
