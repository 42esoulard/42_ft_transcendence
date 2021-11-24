import { User } from 'src/users/interfaces/user.interface';
import { Request } from 'express';

/**
 * This file is an extension of the Request type
 * allowing a request to handle our User type
 * see https://qastack.fr/programming/37377731/extend-express-request-object-using-typescript
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    fileValidationError?: string;
  }
}
