import { Request } from 'express';
import { UserRole } from '../../author/entity/author.entity';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
}
