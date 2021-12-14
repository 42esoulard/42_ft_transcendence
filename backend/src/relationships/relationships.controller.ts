import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { Relationship } from './interfaces/relationship.interface';
import { UsersService } from '../users/users.service';
import { CreateRelationshipDto } from './dto/createRelationship.dto';
import { ValidateRelationshipDto } from './dto/validateRelationship.dto';
import { RemoveRelationshipDto } from './dto/removeRelationship.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/auth/guards/jwtTwoFactor.guard';

@ApiTags('Relationship')
@Controller('relationships')
export class RelationshipsController {
  constructor(
    private readonly relationshipService: RelationshipsService,
    private readonly userService: UsersService,
  ) {}

  //GETTERS

  @Get('/friendships/:id')
  async getUserFriendships(@Param('id') id: number): Promise<Relationship[]> {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.relationshipService.getUserFriendships(id);
  }

  @Get('/relationship/:userA/:userB')
  async getRelationship(
    @Param('userA') userAId: number,
    @Param('userB') userBId: number,
  ): Promise<Relationship> {
    const relationship = await this.relationshipService.getRelationship(
      userAId,
      userBId,
    );
    if (!relationship) throw new NotFoundException("relatioship doesn't exist");
    return relationship;
  }

  @Get('/pending/:id')
  async getPendingRelationships(
    @Param('id') id: number,
  ): Promise<Relationship[]> {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.relationshipService.getPendingRelationships(id);
  }

  @Get('/allfriendships/:id')
  async getAllUserFriendships(
    @Param('id') id: number,
  ): Promise<Relationship[]> {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.relationshipService.getAllUserFriendships(id);
  }

  @Get('/blocked/:id')
  async getUserBlocked(@Param('id') id: number): Promise<Relationship[]> {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.relationshipService.getUserBlocked(id);
  }

  @Get('/blocked-by/:id')
  async getBlockedByUser(@Param('id') id: number): Promise<Relationship[]> {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.relationshipService.getBlockedByUser(id);
  }

  // SAVE-UPDATE-DELETE

  @Post()
  @UseGuards(JwtTwoFactorGuard)
  async saveRelationship(@Body() newRelationship: CreateRelationshipDto) {
    const user1 = await this.userService.getUserbyId(
      newRelationship.requesterId,
    );
    if (!user1) throw new BadRequestException("user doesn't exist");
    const user2 = await this.userService.getUserbyId(
      newRelationship.adresseeId,
    );
    if (!user2) throw new BadRequestException("user doesn't exist");
    const relationship = await this.relationshipService.getRelationship(
      newRelationship.requesterId,
      newRelationship.adresseeId,
    );
    if (relationship) {
      await this.relationshipService
        .removeRelationship({
          userId1: relationship.requesterId,
          userId2: relationship.adresseeId,
        })
        .then()
        .catch();
    }
    return await this.relationshipService.saveRelationship(newRelationship);
  }

  @Post('validate-relationship')
  @UseGuards(JwtTwoFactorGuard)
  async validateRelationship(
    @Body() toMajRelationship: ValidateRelationshipDto,
  ) {
    const relationship = await this.relationshipService.getRelationship(
      toMajRelationship.requesterId,
      toMajRelationship.adresseeId,
    );
    if (!relationship)
      throw new BadRequestException("relationship doesn't exist");
    return await this.relationshipService.validateRelationship(relationship);
  }

  @Delete()
  @UseGuards(JwtTwoFactorGuard)
  async removeRelationship(
    @Body() toRemoveRelationship: RemoveRelationshipDto,
  ) {
    const relationship = await this.relationshipService.getRelationship(
      toRemoveRelationship.userId1,
      toRemoveRelationship.userId2,
    );
    if (!relationship)
      throw new BadRequestException("relationship doesn't exist");
    return await this.relationshipService.removeRelationship(
      toRemoveRelationship,
    );
  }
}
