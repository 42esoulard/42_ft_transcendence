'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateMessageDto = void 0;
const openapi = require('@nestjs/swagger');
const channel_interface_1 = require('../../channels/interfaces/channel.interface');
const user_interface_1 = require('../../users/interfaces/user.interface');
class CreateMessageDto {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      channel_id: { required: true, type: () => Number },
      author_id: { required: true, type: () => Number },
      content: { required: true, type: () => String },
    };
  }
}
exports.CreateMessageDto = CreateMessageDto;
//# sourceMappingURL=createMessage.dto.js.map
