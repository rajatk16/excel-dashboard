import { Global, Module } from '@nestjs/common';

import { QueueService } from '../services/queue.service';
import { QueueHealthService } from '../services/queueHealth.service';

@Global()
@Module({
  providers: [QueueService, QueueHealthService],
  exports: [QueueService, QueueHealthService],
})
export class QueueModule {}
