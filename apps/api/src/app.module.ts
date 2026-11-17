import { Module } from "@nestjs/common";

import { GlobalExceptionFilter } from "./common/filters/globalException.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { RequestContextModule } from "./common/modules/requestContext.module";
import { AppConfigModule } from "./config/modules/appConfig.module";
import { DatabaseModule } from "./database/modules/database.module";
import { HealthModule } from "./health/modules/health.module";
import { QueueModule } from "./queue/modules/queue.module";

@Module({
  imports: [
    AppConfigModule,
    RequestContextModule,
    DatabaseModule,
    QueueModule,
    HealthModule
  ],
  providers: [
    GlobalExceptionFilter,
    ResponseInterceptor
  ]
})
export class AppModule {}
