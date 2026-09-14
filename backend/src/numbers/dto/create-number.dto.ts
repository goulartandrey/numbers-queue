import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export const NUMBER_TYPE = {
  NORMAL: 'normal',
  PRIORITY: 'priority',
} as const;

export type NumberType = (typeof NUMBER_TYPE)[keyof typeof NUMBER_TYPE];

export class CreateNumberDto {
  @IsString()
  name: string;
  @IsString()
  @MinLength(11)
  @MaxLength(14)
  cpf: string;
  @IsIn([NUMBER_TYPE.NORMAL, NUMBER_TYPE.PRIORITY])
  type: NumberType;
}
