import { Module } from '@nestjs/common';
import { NumbersService } from './numbers.service';
import { NumbersController } from './numbers.controller';
import { DatabaseModule } from '@app/database/database.module';
import { NumbersGateway } from './numbers.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [NumbersController],
  providers: [NumbersService, NumbersGateway],
})
export class NumbersModule {}
