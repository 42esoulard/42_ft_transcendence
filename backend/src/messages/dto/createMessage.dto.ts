// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Channel } from 'src/channels/interfaces/channel.interface';
import { User } from 'src/users/interfaces/user.interface';

export class CreateMessageDto {
  readonly channel_id: number;
  readonly author_id: number;
  readonly content: string;
}
