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

  async getFriendship(requester: User, adressee: User): Promise<Friendship> {
    return await this.friendshipsRepository.findOne({
      where: { requester: requester, adressee: adressee }
    });
  }

  async saveFriendship(friendshipDto: CreateFriendshipDto): Promise<Friendship> {
    const newFriendship: Friendship = this.friendshipsRepository.create(friendshipDto);
    newFriendship.pending = true;
    newFriendship.adressee = await this.userService.getUserbyId(friendshipDto.adressee_id);
    return await this.friendshipsRepository.save(newFriendship);
  }

  async validateFriendship(friendshipDto: ValidateFriendshipDto) {
    const requester = await this.userService.getUserbyId(friendshipDto.requester_id);
    const friendship = await this.getFriendship(requester, friendshipDto.adressee);
    return await this.friendshipsRepository.update(friendship.id, { pending: false });
  }

  async removeFriendship(friendshipDto: RemoveFriendshipDto) {
    const requester = await this.userService.getUserbyId(friendshipDto.first_id);
    const adressee = await this.userService.getUserbyId(friendshipDto.second_id);
    let   friendship = await this.getFriendship(requester, adressee);
    if (!friendship)
      friendship = await this.getFriendship(adressee, requester);
    return await this.friendshipsRepository.delete(friendship.id);
  }
}
