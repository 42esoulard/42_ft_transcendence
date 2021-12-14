'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateUserDto = void 0;
const openapi = require('@nestjs/swagger');
class CreateUserDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      username: { required: true, type: () => String },
      forty_two_login: { required: true, type: () => String },
      two_fa_enabled: { required: true, type: () => Boolean },
      banned: { required: false, type: () => Boolean },
      expiry_date: { required: false, type: () => Date },
      avatar: { required: false, type: () => String },
    };
  }
}
exports.CreateUserDto = CreateUserDto;
//# sourceMappingURL=createUser.dto.js.map
