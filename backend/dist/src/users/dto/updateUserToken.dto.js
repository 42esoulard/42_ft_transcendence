'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UpdateUserTokenDto = void 0;
const openapi = require('@nestjs/swagger');
class UpdateUserTokenDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      refresh_token: { required: true, type: () => String },
      expiry_date: { required: true, type: () => Date },
    };
  }
}
exports.UpdateUserTokenDto = UpdateUserTokenDto;
//# sourceMappingURL=updateUserToken.dto.js.map
