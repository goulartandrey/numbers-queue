import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NumbersService } from './numbers.service';
import { CreateNumberDto } from './dto/create-number.dto';
import { NumberType } from '@prisma/client';
import { AuthTokenGuard } from '@app/auth/guards/auth-token.guard';

@UseGuards(AuthTokenGuard)
@Controller('numbers')
export class NumbersController {
  constructor(private readonly numbersService: NumbersService) {}

  @Post()
  generate(@Body() createNumberDto: CreateNumberDto) {
    return this.numbersService.create(createNumberDto);
  }

  @Post('/reset')
  @HttpCode(200)
  async resetCounter(@Body('type') type: NumberType) {
    return await this.numbersService.resetCounter(type);
  }

  @Post('/call-next/:id')
  async callNextNumber(@Param('id') id: string) {
    return await this.numbersService.callNextNumber(id);
  }
}
