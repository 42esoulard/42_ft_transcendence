'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.JwtPayload = void 0;
const openapi = require('@nestjs/swagger');
class JwtPayload {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      sub: { required: true, type: () => Number },
      username: { required: true, type: () => String },
      isTwoFAauthenticated: { required: false, type: () => Boolean },
    };
  }
}
exports.JwtPayload = JwtPayload;
//# sourceMappingURL=jwtPayload.interface.js.map
