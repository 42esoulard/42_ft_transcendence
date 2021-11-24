// import { ApiProperty } from '@nestjs/swagger';
// import { CreateUserDto } from './createUser.dto';

export class UpdateUserTokenDto {
  readonly id: number;
  readonly refresh_token: string;
  readonly expiry_date: Date;
}
