'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateChannelDto = void 0;
const openapi = require('@nestjs/swagger');
class CreateChannelDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      name: { required: true, type: () => String },
      owner_id: { required: true, type: () => Number },
      password: { required: true, type: () => String },
      type: { required: true, type: () => String },
      notification: { required: true, type: () => Boolean },
      recipient_id: { required: true, type: () => Number },
    };
  }
}
exports.CreateChannelDto = CreateChannelDto;
//# sourceMappingURL=createChannel.dto.js.map
