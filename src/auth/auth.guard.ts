import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  // private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  private getBearer(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // check if we are using graphql or normal REST
    const request =
      ctx.getType().toString() === 'graphql'
        ? GqlExecutionContext.create(ctx).getContext().req
        : ctx.switchToHttp().getRequest();

    const token = this.getBearer(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    if (!this.authService.isTokenValid(token)) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'DO NOT USE THIS ON PROD',
      });

      // is there a better way to do this?, add type support
      request.headers['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
