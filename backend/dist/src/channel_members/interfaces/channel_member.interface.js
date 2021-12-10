'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ChannelMember = void 0;
const openapi = require('@nestjs/swagger');
const user_interface_1 = require('../../users/interfaces/user.interface');
const channel_interface_1 = require('../../channels/interfaces/channel.interface');
class ChannelMember {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      channel: {
        required: true,
        type: () =>
          require('../../channels/interfaces/channel.interface').Channel,
      },
      member: {
        required: true,
        type: () => require('../../users/interfaces/user.interface').User,
      },
      is_owner: { required: true, type: () => Boolean },
      is_admin: { required: true, type: () => Boolean },
      notification: { required: true, type: () => Boolean },
      new_message: { required: true, type: () => Boolean },
      mute: { required: true, type: () => String, nullable: true },
      ban: { required: true, type: () => String, nullable: true },
    };
  }
}
exports.ChannelMember = ChannelMember;
//# sourceMappingURL=channel_member.interface.js.map
