'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.RemoveRelationshipDto = void 0;
const openapi = require('@nestjs/swagger');
const user_interface_1 = require('../../users/interfaces/user.interface');
class RemoveRelationshipDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      userId1: { required: true, type: () => Number },
      userId2: { required: true, type: () => Number },
      nature: { required: false, type: () => String },
    };
  }
}
exports.RemoveRelationshipDto = RemoveRelationshipDto;
//# sourceMappingURL=removeRelationship.dto.js.map
