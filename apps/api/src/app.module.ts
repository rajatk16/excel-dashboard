import { Module } from "@nestjs/common";

import { GlobalExceptionFilter } from "./common/filters/globalException.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { RequestContextModule } from "./common/modules/requestContext.module";
import { AppConfigModule } from "./config/modules/appConfig.module";
import { HealthModule } from "./health/modules/health.module";

@Module({
  imports: [
    AppConfigModule,
    RequestContextModule,
    HealthModule
  ],
  providers: [
    GlobalExceptionFilter,
    ResponseInterceptor
  ]
})
export class AppModule {}
