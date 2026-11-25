import { Global, Module } from '@nestjs/common';

import { DatabaseHealthService } from '../services/databaseHealth.service';
import { PrismaService } from '../services/prisma.service';
import { TransactionService } from '../services/transaction.service';

@Global()
@Module({
  providers: [PrismaService, TransactionService, DatabaseHealthService],
  exports: [PrismaService, TransactionService, DatabaseHealthService],
})
export class DatabaseModule {}
