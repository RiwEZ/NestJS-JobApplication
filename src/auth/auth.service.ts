import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsNotEmpty } from 'class-validator';
import { CreateResult, UsersService } from 'src/users/users.service';
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

  isTokenValid(token: string): boolean {
    if (this.blacklistedJWT.has(token)) {
      return false;
    }
    return true;
  }

  async login(body: AuthCredentialsBody): Promise<{ accessToken: string }> {
    const user = await this.userService.findOne(body.username);
    if (user === undefined) {
      throw new NotFoundException();
    }
    const passwordMatched = await bcrypt.compare(user.password, body.password);
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
    if (this.blacklistedJWT.has(token)) {
      throw new BadRequestException();
    }
    this.blacklistedJWT.add(token);
  }

  async register(body: AuthCredentialsBody) {
    const result = await this.userService.create(body.username, body.password);
    if (result === CreateResult.Failed) {
      throw new InternalServerErrorException();
    }
    if (result === CreateResult.Duplicated) {
      throw new BadRequestException('someone already use this username');
    }
  }
}
