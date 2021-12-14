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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MessagesController = void 0;
const openapi = require('@nestjs/swagger');
const common_1 = require('@nestjs/common');
const messages_service_1 = require('./messages.service');
const createMessage_dto_1 = require('./dto/createMessage.dto');
const swagger_1 = require('@nestjs/swagger');
const jwtTwoFactor_guard_1 = require('../auth/guards/jwtTwoFactor.guard');
let MessagesController = class MessagesController {
  constructor(messageService) {
    this.messageService = messageService;
  }
  async saveMessage(newMessage) {
    const msg = await this.messageService.saveMessage(newMessage);
    if (msg == undefined) {
      throw new common_1.NotFoundException('Failed to save message');
    }
    return msg;
  }
};
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 201,
      type: require('./interfaces/message.interface').Message,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [createMessage_dto_1.CreateMessageDto]),
    __metadata('design:returntype', Promise),
  ],
  MessagesController.prototype,
  'saveMessage',
  null,
);
MessagesController = __decorate(
  [
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('messages'),
    __metadata('design:paramtypes', [messages_service_1.MessagesService]),
  ],
  MessagesController,
);
exports.MessagesController = MessagesController;
//# sourceMappingURL=messages.controller.js.map
