import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '@app/database/prisma.service';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
    });

    return { access_token };
  }
}
