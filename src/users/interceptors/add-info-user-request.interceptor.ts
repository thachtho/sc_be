import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { IMethodRequest } from 'src/shared/enum';

@Injectable()
export class AddInfoUserRequestInterceptor implements NestInterceptor {
  constructor(private userService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const { body, user, method } = context.switchToHttp().getRequest();

    if (
      (method === IMethodRequest.POST ||
        method === IMethodRequest.PUT ||
        method === IMethodRequest.PATCH) &&
      user
    ) {
      const response = await this.userService.findOne({
        where: {
          id: user?.id,
        },
      });
      if (method === IMethodRequest.POST) {
        body.createdBy = response?.id;
        body.agencyId = response?.agencyId;
      }
    }
    return next.handle().pipe();
  }
}
