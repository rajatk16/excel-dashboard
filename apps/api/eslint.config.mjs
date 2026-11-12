import { createNestConfig } from '@excel-dashboard/eslint-config/nestjs';

export default createNestConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: true,
});
