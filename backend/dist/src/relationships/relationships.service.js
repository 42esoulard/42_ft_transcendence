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
exports.RelationshipsService = void 0;
const common_1 = require('@nestjs/common');
const relationships_entity_1 = require('./entity/relationships.entity');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const user_interface_1 = require('../users/interfaces/user.interface');
let RelationshipsService = class RelationshipsService {
  constructor(relationshipsRepository) {
    this.relationshipsRepository = relationshipsRepository;
  }
  async getRelationship(user1, user2) {
    return await this.relationshipsRepository.findOne({
      where: [
        { requesterId: user1, adresseeId: user2 },
        { requesterId: user2, adresseeId: user1 },
      ],
    });
  }
  async getPendingRelationships(adresseeId) {
    return await this.relationshipsRepository.find({
      where: [{ adresseeId: adresseeId, pending: 'true' }],
    });
  }
  async getUserFriendships(id) {
    return await this.relationshipsRepository.find({
      where: [
        { requesterId: id, pending: 'false', nature: 'friendship' },
        { adresseeId: id, pending: 'false', nature: 'friendship' },
      ],
    });
  }
  async getAllUserFriendships(id) {
    const ret = await this.relationshipsRepository.find({
      where: [
        { requesterId: id, nature: 'friendship' },
        { adresseeId: id, nature: 'friendship' },
      ],
      relations: ['requester', 'adressee'],
    });
    return ret;
  }
  async getUserBlocked(user) {
    return await this.relationshipsRepository.find({
      where: [
        { requesterId: user, nature: 'blocked' },
        { adresseeId: user, nature: 'blocked' },
      ],
    });
  }
  async getBlockedByUser(user) {
    return await this.relationshipsRepository.find({
      where: [{ requesterId: user, nature: 'blocked' }],
    });
  }
  async saveRelationship(relationshipDto) {
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
    const newRelationship =
      this.relationshipsRepository.create(relationshipDto);
    if (relationshipDto.nature != 'blocked') newRelationship.pending = true;
    return await this.relationshipsRepository
      .save(newRelationship)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Relationship did not comply database requirements',
        );
      });
  }
  async validateRelationship(relationship) {
    relationship.pending = false;
    return await this.relationshipsRepository.update(relationship.id, {
      pending: false,
    });
  }
  async removeRelationship(relationshipDto) {
    const relationship = await this.getRelationship(
      relationshipDto.userId1,
      relationshipDto.userId2,
    );
    if (!relationship)
      throw new common_1.BadRequestException("relationship doesn't exist");
    return await this.relationshipsRepository.delete(relationship.id);
  }
};
RelationshipsService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(
      0,
      (0, typeorm_1.InjectRepository)(relationships_entity_1.Relationships),
    ),
    __metadata('design:paramtypes', [typeorm_2.Repository]),
  ],
  RelationshipsService,
);
exports.RelationshipsService = RelationshipsService;
//# sourceMappingURL=relationships.service.js.map
