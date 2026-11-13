import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "@/app/router/routePaths";
import { getEnvironment } from "@/config/env"

export const Brand = () => {
  const environment = getEnvironment();

  return (
    <Link to={ROUTE_PATHS.HOME} className="brand">
      <img src="/favicon.svg" alt="" width={32} height={32} />
      <span>{environment.VITE_APP_NAME}</span>
    </Link>
  )
}
