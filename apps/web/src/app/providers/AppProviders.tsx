import type { PropsWithChildren } from "react";

import { getEnvironment } from "@/config/env";

export const AppProviders = (props: PropsWithChildren) => {
  getEnvironment();

  return props.children;
}
