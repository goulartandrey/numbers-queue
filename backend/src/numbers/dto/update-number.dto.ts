import { PartialType } from '@nestjs/mapped-types';
import { CreateNumberDto } from './create-number.dto';

export class UpdateNumberDto extends PartialType(CreateNumberDto) {}
