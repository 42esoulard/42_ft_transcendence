import { Injectable } from '@nestjs/common';
import { Relationship } from './interfaces/relationship.interface';
import { Relationships } from './entity/relationships.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFriendshipsDto } from './dto/getFriendships.dto';
import { CreateRelationshipDto } from './dto/createRelationship.dto';
import { ValidateRelationshipDto } from './dto/validateRelationship.dto';
import { RemoveRelationshipDto } from './dto/removeRelationship.dto';
import { User } from 'src/users/interfaces/user.interface';

@Injectable()
export class RelationshipsService {
  constructor(
    @InjectRepository(Relationships)
    private readonly relationshipsRepository: Repository<Relationships>,
  ) {}

  async getRelationship(user1: User, user2: User): Promise<Relationship> {
    return await this.relationshipsRepository.findOne({
      where: [
        { requester: user1, adressee: user2 },
        { requester: user2, adressee: user1 }
      ]
    });
  }

  async getUserFriendships(friendshipsReq: GetFriendshipsDto): Promise<Relationship[]> {
    if (friendshipsReq.pending === true){
      return await this.relationshipsRepository.find({
        where: [
          { requester: friendshipsReq.user, nature: 'friendship' },
          { adressee: friendshipsReq.user, nature: 'friendship' }
        ]
      });
    }
    return await this.relationshipsRepository.find({
      where: [
        { requester: friendshipsReq.user, pending: 'false', nature: 'friendship' },
        { adressee: friendshipsReq.user, pending: 'false', nature: 'friendship' }
      ]
    });
  }

  async getUserBlocked(user: User): Promise<Relationship[]> {
    return await this.relationshipsRepository.find({
      where: [
        { requester: user, nature: 'blocked' },
        { adressee: user, nature: 'blocked' }
      ]
    });
  }

  async saveRelationship(relationshipDto: CreateRelationshipDto): Promise<Relationship> {
    const newRelationship: Relationship = this.relationshipsRepository.create(relationshipDto);
    newRelationship.pending = true;
    return await this.relationshipsRepository.save(newRelationship);
  }

  async validateRelationship(relationshipDto: ValidateRelationshipDto) {
    const relationship = await this.getRelationship(relationshipDto.requester, relationshipDto.adressee);
    relationship.pending = false;
    return await this.relationshipsRepository.update(relationship.id, { pending: false });
  }

  async removeRelationship(relationshipDto: RemoveRelationshipDto) {
    let   relationship = await this.getRelationship(relationshipDto.user1, relationshipDto.user2);
    return await this.relationshipsRepository.delete(relationship.id);
  }
}
