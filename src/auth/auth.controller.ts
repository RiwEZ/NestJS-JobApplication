import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService, AuthCredentialsBody } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() body: AuthCredentialsBody) {
    // TODO, body validation
    return this.authService.signIn(body.username, body.password);
  }

  @Post('register')
  register(@Body() body: AuthCredentialsBody) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    // @ts-expect-error, no extended type yet
    this.logger.log(JSON.stringify(req.user));
    // @ts-expect-error, no extended type yet
    return req.user;
  }
}
