import { Role } from '../models/role.enum';
export declare const ROLES_KEY = 'roles';
export declare const Roles: (
  ...roles: Role[]
) => import('@nestjs/common').CustomDecorator<string>;
