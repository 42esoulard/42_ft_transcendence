import { BadRequestException, Injectable } from '@nestjs/common';
import { Relationship } from './interfaces/relationship.interface';
import { Relationships } from './entity/relationships.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async getRelationship(user1: number, user2: number): Promise<Relationship> {
    return await this.relationshipsRepository.findOne({
      where: [
        { requesterId: user1, adresseeId: user2 },
        { requesterId: user2, adresseeId: user1 },
      ],
    });
  }

  async getPendingRelationships(adresseeId: number): Promise<Relationship[]> {
    return await this.relationshipsRepository.find({
      where: [{ adresseeId: adresseeId, pending: 'true' }],
    });
  }

  async getUserFriendships(id: number): Promise<Relationship[]> {
    return await this.relationshipsRepository.find({
      where: [
        { requesterId: id, pending: 'false', nature: 'friendship' },
        { adresseeId: id, pending: 'false', nature: 'friendship' },
      ],
    });
  }

  async getAllUserFriendships(id: number): Promise<Relationship[]> {
    const ret = await this.relationshipsRepository.find({
      where: [
        { requesterId: id, nature: 'friendship' },
        { adresseeId: id, nature: 'friendship' },
      ],
      relations: ['requester', 'adressee'],
    });
    return ret;
  }

  async getUserBlocked(user: number): Promise<Relationship[]> {
    return await this.relationshipsRepository.find({
      where: [
        { requesterId: user, nature: 'blocked' },
        { adresseeId: user, nature: 'blocked' },
      ],
    });
  }

  async getBlockedByUser(user: number): Promise<Relationship[]> {
    return await this.relationshipsRepository.find({
      where: [{ requesterId: user, nature: 'blocked' }],
    });
  }

  async saveRelationship(
    relationshipDto: CreateRelationshipDto,
  ): Promise<Relationship> {
    if (relationshipDto.nature == 'blocked') {
      const relationship = await this.getRelationship(
        relationshipDto.adresseeId,
        relationshipDto.requesterId,
      );
      if (relationship)
        this.removeRelationship({
          userId1: relationshipDto.adresseeId,
          userId2: relationshipDto.requesterId,
        });
    }
    const newRelationship: Relationship =
      this.relationshipsRepository.create(relationshipDto);
    if (relationshipDto.nature != 'blocked') newRelationship.pending = true;
    return await this.relationshipsRepository
      .save(newRelationship)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Relationship did not comply database requirements',
        );
      });
  }

  async validateRelationship(relationship: Relationship) {
    relationship.pending = false;
    return await this.relationshipsRepository.update(relationship.id, {
      pending: false,
    });
  }

  async removeRelationship(relationshipDto: RemoveRelationshipDto) {
    const relationship = await this.getRelationship(
      relationshipDto.userId1,
      relationshipDto.userId2,
    );
    if (!relationship)
      throw new BadRequestException("relationship doesn't exist");
    return await this.relationshipsRepository.delete(relationship.id);
  }
}
