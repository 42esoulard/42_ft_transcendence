'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.RelationshipsController = void 0;
const openapi = require('@nestjs/swagger');
const common_1 = require('@nestjs/common');
const relationships_service_1 = require('./relationships.service');
const users_service_1 = require('../users/users.service');
const createRelationship_dto_1 = require('./dto/createRelationship.dto');
const validateRelationship_dto_1 = require('./dto/validateRelationship.dto');
const removeRelationship_dto_1 = require('./dto/removeRelationship.dto');
const swagger_1 = require('@nestjs/swagger');
const jwtTwoFactor_guard_1 = require('../auth/guards/jwtTwoFactor.guard');
let RelationshipsController = class RelationshipsController {
  constructor(relationshipService, userService) {
    this.relationshipService = relationshipService;
    this.userService = userService;
  }
  async getUserFriendships(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.relationshipService.getUserFriendships(id);
  }
  async getRelationship(userAId, userBId) {
    const relationship = await this.relationshipService.getRelationship(
      userAId,
      userBId,
    );
    if (!relationship)
      throw new common_1.NotFoundException("relatioship doesn't exist");
    return relationship;
  }
  async getPendingRelationships(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.relationshipService.getPendingRelationships(id);
  }
  async getAllUserFriendships(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.relationshipService.getAllUserFriendships(id);
  }
  async getUserBlocked(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.relationshipService.getUserBlocked(id);
  }
  async getBlockedByUser(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.relationshipService.getBlockedByUser(id);
  }
  async saveRelationship(newRelationship) {
    const user1 = await this.userService.getUserbyId(
      newRelationship.requesterId,
    );
    if (!user1) throw new common_1.BadRequestException("user doesn't exist");
    const user2 = await this.userService.getUserbyId(
      newRelationship.adresseeId,
    );
    if (!user2) throw new common_1.BadRequestException("user doesn't exist");
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
  async validateRelationship(toMajRelationship) {
    const relationship = await this.relationshipService.getRelationship(
      toMajRelationship.requesterId,
      toMajRelationship.adresseeId,
    );
    if (!relationship)
      throw new common_1.BadRequestException("relationship doesn't exist");
    return await this.relationshipService.validateRelationship(relationship);
  }
  async removeRelationship(toRemoveRelationship) {
    const relationship = await this.relationshipService.getRelationship(
      toRemoveRelationship.userId1,
      toRemoveRelationship.userId2,
    );
    if (!relationship)
      throw new common_1.BadRequestException("relationship doesn't exist");
    return await this.relationshipService.removeRelationship(
      toRemoveRelationship,
    );
  }
};
__decorate(
  [
    (0, common_1.Get)('/friendships/:id'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/relationship.interface').Relationship],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'getUserFriendships',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/relationship/:userA/:userB'),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/relationship.interface').Relationship,
    }),
    __param(0, (0, common_1.Param)('userA')),
    __param(1, (0, common_1.Param)('userB')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Number]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'getRelationship',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/pending/:id'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/relationship.interface').Relationship],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'getPendingRelationships',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/allfriendships/:id'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/relationship.interface').Relationship],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'getAllUserFriendships',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/blocked/:id'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/relationship.interface').Relationship],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'getUserBlocked',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/blocked-by/:id'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/relationship.interface').Relationship],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'getBlockedByUser',
  null,
);
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 201,
      type: require('./interfaces/relationship.interface').Relationship,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      createRelationship_dto_1.CreateRelationshipDto,
    ]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'saveRelationship',
  null,
);
__decorate(
  [
    (0, common_1.Post)('validate-relationship'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      validateRelationship_dto_1.ValidateRelationshipDto,
    ]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'validateRelationship',
  null,
);
__decorate(
  [
    (0, common_1.Delete)(),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      removeRelationship_dto_1.RemoveRelationshipDto,
    ]),
    __metadata('design:returntype', Promise),
  ],
  RelationshipsController.prototype,
  'removeRelationship',
  null,
);
RelationshipsController = __decorate(
  [
    (0, swagger_1.ApiTags)('Relationship'),
    (0, common_1.Controller)('relationships'),
    __metadata('design:paramtypes', [
      relationships_service_1.RelationshipsService,
      users_service_1.UsersService,
    ]),
  ],
  RelationshipsController,
);
exports.RelationshipsController = RelationshipsController;
//# sourceMappingURL=relationships.controller.js.map
