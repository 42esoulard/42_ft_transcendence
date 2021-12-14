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
Object.defineProperty(exports, '__esModule', { value: true });
exports.Relationships = void 0;
const openapi = require('@nestjs/swagger');
const users_entity_1 = require('../../users/entity/users.entity');
const typeorm_1 = require('typeorm');
let Relationships = class Relationships {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      requesterId: { required: true, type: () => Number },
      requester: {
        required: true,
        type: () => require('../../users/entity/users.entity').Users,
      },
      adresseeId: { required: true, type: () => Number },
      adressee: {
        required: true,
        type: () => require('../../users/entity/users.entity').Users,
      },
      pending: { required: true, type: () => Boolean },
      nature: { required: true, type: () => String },
      created_at: { required: true, type: () => Date },
    };
  }
};
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)(), __metadata('design:type', Number)],
  Relationships.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'number' }),
    __metadata('design:type', Number),
  ],
  Relationships.prototype,
  'requesterId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => users_entity_1.Users,
      (requester) => requester.relationships_requested,
      {
        onDelete: 'CASCADE',
        eager: true,
      },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'requesterId' }),
    __metadata('design:type', users_entity_1.Users),
  ],
  Relationships.prototype,
  'requester',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'number' }),
    __metadata('design:type', Number),
  ],
  Relationships.prototype,
  'adresseeId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => users_entity_1.Users,
      (adressee) => adressee.relationships_adressed,
      {
        onDelete: 'CASCADE',
        eager: true,
      },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'adresseeId' }),
    __metadata('design:type', users_entity_1.Users),
  ],
  Relationships.prototype,
  'adressee',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: true }),
    __metadata('design:type', Boolean),
  ],
  Relationships.prototype,
  'pending',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: 'friendship' }),
    __metadata('design:type', String),
  ],
  Relationships.prototype,
  'nature',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.CreateDateColumn)({
      type: 'timestamp',
      default: () => 'now()',
    }),
    __metadata('design:type', Date),
  ],
  Relationships.prototype,
  'created_at',
  void 0,
);
Relationships = __decorate(
  [(0, typeorm_1.Entity)('relationships')],
  Relationships,
);
exports.Relationships = Relationships;
//# sourceMappingURL=relationships.entity.js.map
