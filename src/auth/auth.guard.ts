import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/libs/guard/guard';
import { jwtConstants } from './auth.module';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/user.entity';
import { ROLE } from 'src/shared/enum';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UsersService,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const roles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      const user = await this.userService.findOne({
        where: {
          id: payload.userId,
        },
        select: ['role', 'id', 'agencyId', 'nickname'],
      });

      this.checkPermission(roles, user);
      request['user'] = user;
      this.cls.set('user', JSON.stringify(user));
    } catch (err) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const cookieString = request.headers.cookie;
    if (cookieString) {
      const cookieToken = this.getValueByKeyInCookie(cookieString, 'token');

      if (cookieToken) {
        return cookieToken;
      }
    }

    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getValueByKeyInCookie(cookieString: string, key: string) {
    const valueCookie = cookieString
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${key}=`));

    let tokenValue: string | undefined;
    if (valueCookie) {
      const [, value] = valueCookie.split('=');
      tokenValue = value;
    }

    return tokenValue;
  }

  private checkPermission(roles: number[], user: UserEntity) {
    if (user.role === ROLE.ADMIN) {
      return;
    }

    if (roles) {
      const isCheck = roles.includes(user.role);

      if (!isCheck) {
        throw new UnauthorizedException();
      }
    }
  }
}
