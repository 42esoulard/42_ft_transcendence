'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Channel = void 0;
const openapi = require('@nestjs/swagger');
const user_interface_1 = require('../../users/interfaces/user.interface');
const message_interface_1 = require('../../messages/interfaces/message.interface');
const channel_member_interface_1 = require('../../channel_members/interfaces/channel_member.interface');
class Channel {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      name: { required: true, type: () => String },
      type: { required: true, type: () => String },
      password: { required: true, type: () => String },
      messages: {
        required: true,
        type: () => [
          require('../../messages/interfaces/message.interface').Message,
        ],
      },
      channel_members: {
        required: true,
        type: () => [
          require('../../channel_members/interfaces/channel_member.interface')
            .ChannelMember,
        ],
      },
      created_at: { required: true, type: () => Date },
    };
  }
}
exports.Channel = Channel;
//# sourceMappingURL=channel.interface.js.map
