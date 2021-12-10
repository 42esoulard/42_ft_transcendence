'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateRelationshipDto = void 0;
const openapi = require('@nestjs/swagger');
const user_interface_1 = require('../../users/interfaces/user.interface');
class CreateRelationshipDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      requesterId: { required: true, type: () => Number },
      adresseeId: { required: true, type: () => Number },
      nature: { required: false, type: () => String },
    };
  }
}
exports.CreateRelationshipDto = CreateRelationshipDto;
//# sourceMappingURL=createRelationship.dto.js.map
