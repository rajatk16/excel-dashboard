import { Module } from '@nestjs/common';

import { StorageModule } from '../../storage/modules/storage.module';
import { HealthController } from '../controllers/health.controller';
import { StorageHealthIndicator } from '../indicators/storage.indicator';
import { HealthService } from '../services/health.service';

@Module({
  imports: [StorageModule],
  controllers: [HealthController],
  providers: [HealthService, StorageHealthIndicator],
  exports: [HealthService],
})
export class HealthModule {}
