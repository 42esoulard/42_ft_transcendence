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
Object.defineProperty(exports, '__esModule', { value: true });
exports.RelationshipsModule = exports.RelationshipsService = void 0;
const common_1 = require('@nestjs/common');
const relationships_service_1 = require('./relationships.service');
var relationships_service_2 = require('./relationships.service');
Object.defineProperty(exports, 'RelationshipsService', {
  enumerable: true,
  get: function () {
    return relationships_service_2.RelationshipsService;
  },
});
const relationships_controller_1 = require('./relationships.controller');
const typeorm_1 = require('@nestjs/typeorm');
const users_module_1 = require('../users/users.module');
const relationships_entity_1 = require('./entity/relationships.entity');
let RelationshipsModule = class RelationshipsModule {};
RelationshipsModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          relationships_entity_1.Relationships,
        ]),
        users_module_1.UsersModule,
      ],
      providers: [relationships_service_1.RelationshipsService],
      controllers: [relationships_controller_1.RelationshipsController],
      exports: [relationships_service_1.RelationshipsService],
    }),
  ],
  RelationshipsModule,
);
exports.RelationshipsModule = RelationshipsModule;
//# sourceMappingURL=relationships.module.js.map
