import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { Friendship } from './interfaces/friendship.interface';
import { CreateFriendshipDto } from './dto/createFriendship.dto';
import { ValidateFriendshipDto } from './dto/validateFriendship.dto';
import { RemoveFriendshipDto } from './dto/removeFriendship.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Friendship')
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipService: FriendshipsService) {}

  @Post()
  async saveFriendship(@Body() newFriendship: CreateFriendshipDto): Promise<Friendship> {
    return await this.friendshipService.saveFriendship(newFriendship);
  }

  @Post('validate-friendship')
  async validateFriendship(@Body() toMajFriendship: ValidateFriendshipDto) {
    return await this.friendshipService.validateFriendship(toMajFriendship);
  }

  @Delete()
  async removeFriendship(@Body() toRemoveFriendship: RemoveFriendshipDto) {
    return await this.friendshipService.removeFriendship(toRemoveFriendship);
  }
}
