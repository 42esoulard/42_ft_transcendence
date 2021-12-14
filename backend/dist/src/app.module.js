'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppModule = void 0;
const common_1 = require('@nestjs/common');
const app_controller_1 = require('./app.controller');
const app_service_1 = require('./app.service');
const typeorm_1 = require('@nestjs/typeorm');
const config_service_1 = require('./config/config.service');
const users_module_1 = require('./users/users.module');
const messages_module_1 = require('./messages/messages.module');
const channels_module_1 = require('./channels/channels.module');
const chat_module_1 = require('./chat/chat.module');
const auth_module_1 = require('./auth/auth.module');
const passport_1 = require('@nestjs/passport');
const pong_module_1 = require('./pong/pong.module');
const relationships_module_1 = require('./relationships/relationships.module');
const presence_module_1 = require('./presence/presence.module');
let AppModule = class AppModule {};
AppModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forRoot(
          config_service_1.configService.getTypeOrmConfig(),
        ),
        users_module_1.UsersModule,
        chat_module_1.ChatModule,
        messages_module_1.MessagesModule,
        channels_module_1.ChannelsModule,
        auth_module_1.AuthModule,
        relationships_module_1.RelationshipsModule,
        passport_1.PassportModule.register({ session: true }),
        pong_module_1.PongModule,
        presence_module_1.PresenceModule,
      ],
      controllers: [app_controller_1.AppController],
      providers: [app_service_1.AppService],
    }),
  ],
  AppModule,
);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map
