'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UpdateUserDto = void 0;
const openapi = require('@nestjs/swagger');
class UpdateUserDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      username: { required: false, type: () => String },
      two_fa_enabled: { required: false, type: () => Boolean },
      avatar: { required: false, type: () => String },
    };
  }
}
exports.UpdateUserDto = UpdateUserDto;
//# sourceMappingURL=updateUser.dto.js.map
