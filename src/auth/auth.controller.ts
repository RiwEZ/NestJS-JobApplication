import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService, AuthCredentialsBody } from './auth.service';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

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
  register(@Body() body: AuthCredentialsBody) {
    return this.authService.register(body);
  }

  @Get('profile')
  getProfile(@Req() req: Request) {
    // @ts-expect-error, no extended type yet
    this.logger.log(JSON.stringify(req.user));
    // @ts-expect-error, no extended type yet
    return req.user;
  }
}
