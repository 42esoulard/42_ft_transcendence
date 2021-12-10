'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Relationship = void 0;
const openapi = require('@nestjs/swagger');
const users_entity_1 = require('../../users/entity/users.entity');
class Relationship {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      pending: { required: true, type: () => Boolean },
      created_at: { required: true, type: () => Date },
      requesterId: { required: true, type: () => Number },
      adresseeId: { required: true, type: () => Number },
      nature: { required: false, type: () => String },
      adressee: {
        required: false,
        type: () => require('../../users/entity/users.entity').Users,
      },
      requester: {
        required: false,
        type: () => require('../../users/entity/users.entity').Users,
      },
    };
  }
}
exports.Relationship = Relationship;
//# sourceMappingURL=relationship.interface.js.map
