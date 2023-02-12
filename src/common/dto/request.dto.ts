import { Request } from 'express';
import { User } from 'src/db/user.entity';

interface RequestUser extends User {
  role: string;
}

export interface RequestDto extends Omit<Request, 'user'> {
  user: RequestUser;
}
