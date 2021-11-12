import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { Relationship } from './interfaces/relationship.interface';
import { User } from 'src/users/interfaces/user.interface';
import { GetFriendshipsDto } from './dto/getFriendships.dto';
import { CreateRelationshipDto } from './dto/createRelationship.dto';
import { ValidateRelationshipDto } from './dto/validateRelationship.dto';
import { RemoveRelationshipDto } from './dto/removeRelationship.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Relationship')
@Controller('relationships')
export class RelationshipsController {
  constructor(private readonly relationshipService: RelationshipsService) {}

  @Get('friendships')
  async getUserFriendships(@Body() friendshipsReq: GetFriendshipsDto): Promise<Relationship[]> {
    return await this.relationshipService.getUserFriendships(friendshipsReq);
  }

  @Get('blocked')
  async getUserBlocked(user: User): Promise<Relationship[]> {
    return await this.relationshipService.getUserBlocked(user);
  }

  @Post()
  async saveRelationship(@Body() newRelationship: CreateRelationshipDto): Promise<Relationship> {
    return await this.relationshipService.saveRelationship(newRelationship);
  }

  @Post('validate-relationship')
  async validateRelationship(@Body() toMajRelationship: ValidateRelationshipDto) {
    return await this.relationshipService.validateRelationship(toMajRelationship);
  }

  @Delete()
  async removeRelationship(@Body() toRemoveRelationship: RemoveRelationshipDto) {
    return await this.relationshipService.removeRelationship(toRemoveRelationship);
  }
}
