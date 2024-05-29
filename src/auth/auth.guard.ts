import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { UserKind } from 'src/users/users.schema';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const Company = () => SetMetadata(ROLES_KEY, UserKind.COMPANY);
export const Candidate = () => SetMetadata(ROLES_KEY, UserKind.CANDIDATE);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private userService: UsersService,
    private reflector: Reflector,
  ) {}

  private getBearer(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  // this should be cached, or not the request will be slow
  private async matchRole(username: string, role: string): Promise<boolean> {
    const result = await this.userService.findOne(username);
    if (result === null) {
      return false;
    }
    if (result.kind.toString() !== role) {
      return false;
    }
    return true;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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
      request.user = payload;

      const role = this.reflector.get(ROLES_KEY, ctx.getHandler());
      if (!role) {
        return true;
      }

      return this.matchRole(payload.name, role);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
