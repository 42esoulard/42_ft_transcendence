import { Relationship } from './interfaces/relationship.interface';
import { Relationships } from './entity/relationships.entity';
import { Repository } from 'typeorm';
import { CreateRelationshipDto } from './dto/createRelationship.dto';
import { RemoveRelationshipDto } from './dto/removeRelationship.dto';
export declare class RelationshipsService {
  private readonly relationshipsRepository;
  constructor(relationshipsRepository: Repository<Relationships>);
  getRelationship(user1: number, user2: number): Promise<Relationship>;
  getPendingRelationships(adresseeId: number): Promise<Relationship[]>;
  getUserFriendships(id: number): Promise<Relationship[]>;
  getAllUserFriendships(id: number): Promise<Relationship[]>;
  getUserBlocked(user: number): Promise<Relationship[]>;
  getBlockedByUser(user: number): Promise<Relationship[]>;
  saveRelationship(
    relationshipDto: CreateRelationshipDto,
  ): Promise<Relationship>;
  validateRelationship(
    relationship: Relationship,
  ): Promise<import('typeorm').UpdateResult>;
  removeRelationship(
    relationshipDto: RemoveRelationshipDto,
  ): Promise<import('typeorm').DeleteResult>;
}
