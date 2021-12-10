import { RelationshipsService } from './relationships.service';
import { Relationship } from './interfaces/relationship.interface';
import { UsersService } from '../users/users.service';
import { CreateRelationshipDto } from './dto/createRelationship.dto';
import { ValidateRelationshipDto } from './dto/validateRelationship.dto';
import { RemoveRelationshipDto } from './dto/removeRelationship.dto';
export declare class RelationshipsController {
  private readonly relationshipService;
  private readonly userService;
  constructor(
    relationshipService: RelationshipsService,
    userService: UsersService,
  );
  getUserFriendships(id: number): Promise<Relationship[]>;
  getRelationship(userAId: number, userBId: number): Promise<Relationship>;
  getPendingRelationships(id: number): Promise<Relationship[]>;
  getAllUserFriendships(id: number): Promise<Relationship[]>;
  getUserBlocked(id: number): Promise<Relationship[]>;
  getBlockedByUser(id: number): Promise<Relationship[]>;
  saveRelationship(
    newRelationship: CreateRelationshipDto,
  ): Promise<Relationship>;
  validateRelationship(
    toMajRelationship: ValidateRelationshipDto,
  ): Promise<import('typeorm').UpdateResult>;
  removeRelationship(
    toRemoveRelationship: RemoveRelationshipDto,
  ): Promise<import('typeorm').DeleteResult>;
}
