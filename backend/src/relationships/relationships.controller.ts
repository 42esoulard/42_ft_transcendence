import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { Relationship } from './interfaces/relationship.interface';
import { CreateRelationshipDto } from './dto/createRelationship.dto';
import { ValidateRelationshipDto } from './dto/validateRelationship.dto';
import { RemoveRelationshipDto } from './dto/removeRelationship.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Relationship')
@Controller('relationships')
export class RelationshipsController {
  constructor(private readonly relationshipService: RelationshipsService) {}

  @Get('/friendships/:id')
  async getUserFriendships(@Param('id') id: number): Promise<Relationship[]> {
    return await this.relationshipService.getUserFriendships(id);
  }

  @Get('/allfriendships/:id')
  async getAllUserFriendships(
    @Param('id') id: number,
  ): Promise<Relationship[]> {
    return await this.relationshipService.getAllUserFriendships(id);
  }

  @Get('/blocked/:id')
  async getUserBlocked(@Param('id') id: number): Promise<Relationship[]> {
    return await this.relationshipService.getUserBlocked(id);
  }

  @Get('/blocked-by/:id')
  async getBlockedByUser(@Param('id') id: number): Promise<Relationship[]> {
    return await this.relationshipService.getBlockedByUser(id);
  }

  @Post()
  async saveRelationship(
    @Body() newRelationship: CreateRelationshipDto,
  ): Promise<Relationship> {
    return await this.relationshipService.saveRelationship(newRelationship);
  }

  @Post('validate-relationship')
  async validateRelationship(
    @Body() toMajRelationship: ValidateRelationshipDto,
  ) {
    return await this.relationshipService.validateRelationship(
      toMajRelationship,
    );
  }

  @Delete()
  async removeRelationship(
    @Body() toRemoveRelationship: RemoveRelationshipDto,
  ) {
    return await this.relationshipService.removeRelationship(
      toRemoveRelationship,
    );
  }
}
