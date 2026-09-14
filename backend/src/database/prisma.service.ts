import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg(`${process.env.DATABASE_URL}`);
    super({ adapter });
  }
  async onModuleDestroy() {
    return await this.$disconnect();
  }
  async onModuleInit() {
    await this.$connect();
  }
}
