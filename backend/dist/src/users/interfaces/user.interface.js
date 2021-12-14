'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.User = void 0;
const openapi = require('@nestjs/swagger');
const message_interface_1 = require('../../messages/interfaces/message.interface');
const gameUser_entity_1 = require('../../pong/entity/gameUser.entity');
const relationship_interface_1 = require('../../relationships/interfaces/relationship.interface');
const channel_member_interface_1 = require('../../channel_members/interfaces/channel_member.interface');
class User {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      username: { required: true, type: () => String },
      created_at: { required: false, type: () => Date },
      forty_two_login: { required: false, type: () => String },
      avatar: { required: false, type: () => String },
      two_fa_secret: { required: false, type: () => String },
      two_fa_enabled: { required: false, type: () => Boolean },
      refresh_token: { required: false, type: () => String },
      banned: { required: false, type: () => Boolean },
      expiry_date: { required: false, type: () => Date },
      messages: {
        required: false,
        type: () => [
          require('../../messages/interfaces/message.interface').Message,
        ],
      },
      channel_members: {
        required: false,
        type: () => [
          require('../../channel_members/interfaces/channel_member.interface')
            .ChannelMember,
        ],
      },
      games: {
        required: false,
        type: () => [require('../../pong/entity/gameUser.entity').GameUser],
      },
      role: { required: false, type: () => String },
      relationships_requested: {
        required: false,
        type: () => [
          require('../../relationships/interfaces/relationship.interface')
            .Relationship,
        ],
      },
      relationships_adressed: {
        required: false,
        type: () => [
          require('../../relationships/interfaces/relationship.interface')
            .Relationship,
        ],
      },
    };
  }
}
exports.User = User;
//# sourceMappingURL=user.interface.js.map
