import {
  Injectable,
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
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
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
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(body: AuthCredentialsBody) {
    return this.userService.create(body.username, body.password);
  }
}
