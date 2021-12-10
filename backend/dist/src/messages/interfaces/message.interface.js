'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Message = void 0;
const openapi = require('@nestjs/swagger');
const channels_entity_1 = require('../../channels/entity/channels.entity');
const channel_interface_1 = require('../../channels/interfaces/channel.interface');
const users_entity_1 = require('../../users/entity/users.entity');
const user_interface_1 = require('../../users/interfaces/user.interface');
class Message {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      channel: {
        required: true,
        type: () => require('../../channels/entity/channels.entity').Channels,
      },
      author: {
        required: true,
        type: () => require('../../users/entity/users.entity').Users,
      },
      content: { required: true, type: () => String },
      created_at: { required: true, type: () => Date },
    };
  }
}
exports.Message = Message;
//# sourceMappingURL=message.interface.js.map
