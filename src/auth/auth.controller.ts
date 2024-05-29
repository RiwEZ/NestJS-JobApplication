import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  SetMetadata,
} from '@nestjs/common';
import {
  AuthCredentialsBody,
  AuthService,
  RegisterAuthCredentialsBody,
} from './auth.service';
import { IS_PUBLIC_KEY } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: AuthCredentialsBody) {
    return this.authService.login(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Headers('Authorization') authorization: string | undefined) {
    return this.authService.logout(authorization);
  }

  @SetMetadata(IS_PUBLIC_KEY, true)
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() body: RegisterAuthCredentialsBody) {
    return this.authService.register(body);
  }
}
