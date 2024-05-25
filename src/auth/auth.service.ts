import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsNotEmpty } from 'class-validator';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

export class AuthCredentialsBody {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

@Injectable()
export class AuthService {
  // if many users, this could be some other in memory DB
  // and maybe we could use short live access token with refresh token
  // but to simplify this, I think i'll went with this simpler way
  private blacklistedJWT = new Set();

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findOne(username);
    if (user === undefined) {
      throw new NotFoundException();
    }
    const passwordMatched = await bcrypt.compare(user.password, password);
    if (passwordMatched) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, name: user.username };
    const token = await this.jwtService.signAsync(payload);

    if (!this.isTokenValid(token)) {
      throw new UnauthorizedException();
    }

    return {
      accessToken: token,
    };
  }

  async logout(authorization: string | undefined) {
    const [type, token] = authorization?.split(' ') ?? [];
    if (type.toLowerCase() !== 'bearer') {
      throw new BadRequestException();
    }
    this.blacklistedJWT.add(token);
  }

  isTokenValid(token: string): boolean {
    if (this.blacklistedJWT.has(token)) {
      return false;
    }
    return true;
  }

  async register(body: AuthCredentialsBody) {
    const success = await this.userService.create(body.username, body.password);
    if (!success) {
      throw new InternalServerErrorException();
    }
  }
}
