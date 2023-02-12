import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../db/user.entity';
export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext): User => {
    const req = context.switchToHttp().getRequest();
    console.log(req);
    return req.user;
  },
);
