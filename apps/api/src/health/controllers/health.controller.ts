import { Controller, Get, Header, ServiceUnavailableException, Version, VERSION_NEUTRAL } from "@nestjs/common";

import { RawResponse } from "../../common/decorators/rawResponse.decorator";
import type { HealthService, HealthStatus, LivenessStatus, ReadinessStatus } from "../services/health.service";

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  getHealth(): HealthStatus {
    return this.healthService.getHealth();
  }

  @Get('live')
  @Version(VERSION_NEUTRAL)
  @RawResponse()
  @Header('Cache-Control', 'no-store')
  getLiveness(): LivenessStatus {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @Version(VERSION_NEUTRAL)
  @RawResponse()
  @Header('Cache-Control', 'no-store')
  getReadiness(): ReadinessStatus {
    const readiness = this.healthService.getReadiness();

    if (readiness.status !== 'ready') {
      throw new ServiceUnavailableException();
    }

    return readiness;
  }

}
