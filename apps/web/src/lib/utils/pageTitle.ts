import { useEffect } from "react"

import { getEnvironment } from "@/config/env"

export const usePageTitle = (title?: string): void => {
  useEffect(() => {
    const environment = getEnvironment();

    const previousTitle = document.title;

    document.title = title ? `${title} | ${environment.VITE_APP_NAME}` : environment.VITE_APP_NAME;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
