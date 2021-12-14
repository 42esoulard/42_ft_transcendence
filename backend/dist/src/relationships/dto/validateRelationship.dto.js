'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ValidateRelationshipDto = void 0;
const openapi = require('@nestjs/swagger');
const user_interface_1 = require('../../users/interfaces/user.interface');
class ValidateRelationshipDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      adresseeId: { required: true, type: () => Number },
      requesterId: { required: true, type: () => Number },
    };
  }
}
exports.ValidateRelationshipDto = ValidateRelationshipDto;
//# sourceMappingURL=validateRelationship.dto.js.map
