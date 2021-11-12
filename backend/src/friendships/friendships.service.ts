import { Injectable } from '@nestjs/common';
import { Friendship } from './interfaces/friendship.interface';
import { Friendships } from './entity/friendships.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendshipDto } from './dto/createFriendship.dto';
import { ValidateFriendshipDto } from './dto/validateFriendship.dto';
import { RemoveFriendshipDto } from './dto/removeFriendship.dto';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(Friendships)
    private readonly friendshipsRepository: Repository<Friendships>,
    private readonly userService: UsersService,
  ) {}

  async getFriendship(user1: User, user2: User): Promise<Friendship> {
    return await this.friendshipsRepository.findOne({
      where: [
        { requester: user1, adressee: user2 },
        { requester: user2, adressee: user1 }
      ]
    });
  }

  async saveFriendship(friendshipDto: CreateFriendshipDto): Promise<Friendship> {
    const newFriendship: Friendship = this.friendshipsRepository.create(friendshipDto);
    return await this.friendshipsRepository.save(newFriendship);
  }

  async validateFriendship(friendshipDto: ValidateFriendshipDto) {
    const friendship = await this.getFriendship(friendshipDto.requester, friendshipDto.adressee);
    return await this.friendshipsRepository.update(friendship.id, { pending: false });
  }

  async removeFriendship(friendshipDto: RemoveFriendshipDto) {
    let   friendship = await this.getFriendship(friendshipDto.user1, friendshipDto.user2);
    return await this.friendshipsRepository.delete(friendship.id);
  }
}
