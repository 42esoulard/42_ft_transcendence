// import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto {
  readonly id: number;
  // all these following attributes can be optionnal, id is mandatory
  // That way, UpdateUserDto can be used to update any User attribute in db
  readonly username?: string;
  readonly two_fa_enabled?: boolean;
  readonly avatar?: string;
}
