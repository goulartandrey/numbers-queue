import {
  Controller,
  Post,
  Body,
  HttpCode,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NumbersService } from './numbers.service';
import { CreateNumberDto } from './dto/create-number.dto';
import { NumberType } from '@prisma/client';
import { AuthTokenGuard } from '@app/auth/guards/auth-token.guard';
import { type Request } from 'express';

@Controller('numbers')
export class NumbersController {
  constructor(private readonly numbersService: NumbersService) {}

  @Post()
  generate(@Body() createNumberDto: CreateNumberDto) {
    return this.numbersService.create(createNumberDto);
  }

  @UseGuards(AuthTokenGuard)
  @Post('/reset')
  @HttpCode(200)
  async resetCounter(@Req() req: Request, @Body('type') type: NumberType) {
    console.log(req['payload']);
    return await this.numbersService.resetCounter(type);
  }
  
  @UseGuards(AuthTokenGuard)
  @Post('/call-next/:id')
  async callNextNumber(@Param('id') id: string) {
    return await this.numbersService.callNextNumber(id);
  }
}
