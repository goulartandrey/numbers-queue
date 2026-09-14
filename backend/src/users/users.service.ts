import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@app/database/prisma.service';
import { Prisma } from '@prisma/client';
import { HashingService } from '@app/auth/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await this.hashingService.hash(
        createUserDto.password,
      );
      return await this.prisma.user.create({
        data: {
          username: createUserDto.username,
          password: hashedPassword,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username already in use');
      }
      throw error;
    }
  }
  findAll() {
    return `This action returns all users`;
  }

  async findOne(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
