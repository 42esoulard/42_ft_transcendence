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
exports.UsersController = void 0;
const openapi = require('@nestjs/swagger');
const common_1 = require('@nestjs/common');
const users_service_1 = require('./users.service');
const updateUser_dto_1 = require('./dto/updateUser.dto');
const swagger_1 = require('@nestjs/swagger');
const platform_express_1 = require('@nestjs/platform-express');
const files_upload_utils_1 = require('../utils/files-upload.utils');
const files_manipulation_utils_1 = require('../utils/files-manipulation.utils');
const fs_1 = require('fs');
const path_1 = require('path');
const jwtTwoFactor_guard_1 = require('../auth/guards/jwtTwoFactor.guard');
const roles_decorator_1 = require('../auth/decorators/roles.decorator');
const role_enum_1 = require('../auth/models/role.enum');
const roles_guard_1 = require('../auth/guards/roles.guard');
let UsersController = class UsersController {
  constructor(userService) {
    this.userService = userService;
  }
  async getUsers() {
    const users = await this.userService.getUsers();
    if (users == undefined) {
      throw new common_1.NotFoundException('No users in database');
    }
    return users;
  }
  async getUsersLadder() {
    const users = await this.userService.getUsersLadder();
    if (users == undefined) {
      throw new common_1.NotFoundException('No users in database');
    }
    return users;
  }
  async getBannedUsers() {
    const users = await this.userService.getBannedUsers();
    if (users == undefined) {
      throw new common_1.NotFoundException('No banned users in database');
    }
    return users;
  }
  async getAdmins() {
    const users = await this.userService.getAdmins();
    if (users == undefined) {
      throw new common_1.NotFoundException('No admins in database');
    }
    return users;
  }
  async getUser(id) {
    const user = await this.userService.getUserbyId(id);
    if (user == undefined) {
      throw new common_1.NotFoundException("User doesn't exist");
    }
    return user;
  }
  async getUserByUsername(username) {
    const user = await this.userService.getUserByUsername(username);
    if (user == undefined) {
      throw new common_1.NotFoundException("User doesn't exist");
    }
    return user;
  }
  async getUserByLogin(login) {
    const user = await this.userService.getUserByLogin(login);
    if (user == undefined) {
      throw new common_1.NotFoundException("User doesn't exist");
    }
    return user;
  }
  async removeUser(id, request) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    if (request.user.id != id) {
      const reqUser = await this.userService.getUserbyId(request.user.id);
      if (reqUser && reqUser.role == 'user') {
        throw new common_1.ForbiddenException(
          'not authorized to delete other users',
        );
      }
    }
    return await this.userService.removeUser(id);
  }
  async banUser(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.userService.banUser(id);
  }
  async unbanUser(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.userService.unbanUser(id);
  }
  async promoteUser(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.userService.promoteUser(id);
  }
  async demoteUser(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.userService.demoteUser(id);
  }
  async changeOwner(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.userService.changeOwner(id);
  }
  async updateUser(updatedUser, request) {
    const id = updatedUser.id;
    if (request.user.id != id) {
      const reqUser = await this.userService.getUserbyId(request.user.id);
      if (reqUser && reqUser.role == 'user') {
        throw new common_1.ForbiddenException(
          'not authorized to update other users',
        );
      }
    }
    if (!/^[a-zA-Z]+$/.test(updatedUser.username)) {
      throw new common_1.BadRequestException('invalid username');
    }
    const currentUser = await this.userService.getUserbyId(updatedUser.id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    if (currentUser.username != updatedUser.username) {
      if (await this.userService.getUserByUsername(updatedUser.username))
        throw new common_1.BadRequestException('username already taken');
    }
    await this.userService.updateUser(updatedUser);
  }
  async uploadFile(req, file) {
    const currentUser = await this.userService.getUserbyId(req.user.id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    if (req.fileValidationError) {
      console.log(req.fileValidationError);
      throw new common_1.BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new common_1.BadRequestException('Invalid file');
    }
    if (
      !(await (0, files_upload_utils_1.IsFileExtensionSafe)(`./${file.path}`))
    ) {
      (0, files_upload_utils_1.removeFile)(`./${file.path}`);
      throw new common_1.BadRequestException('Invalid file, hacker !?');
    }
    let newFilePath = file.path.replace('_tmp', '');
    const ext = (0, path_1.extname)(file.path);
    if (ext != '.jpg') {
      newFilePath = newFilePath.replace(ext, '.jpg');
      file.filename = file.filename.replace(ext, '.jpg');
    }
    (0, files_manipulation_utils_1.handleAvatar)(
      `./${file.path}`,
      `./${newFilePath}`,
    );
    file.filename = file.filename.replace('_tmp', '');
    this.userService.updateUser({
      id: req.user.id,
      avatar: `${process.env.BASE_URL}/users/avatars/${file.filename}`,
    });
    setTimeout(() => {
      (0, files_upload_utils_1.removeFile)(file.path);
    }, 1000);
    const response = {
      message: 'Avatar has been uploaded successfully',
      originalname: file.originalname,
      filename: file.filename,
    };
    return response;
  }
  getAvatar(filename, res) {
    const file = (0, fs_1.createReadStream)(
      (0, path_1.join)('./uploads/avatars/', filename),
    ).on('error', () => {
      res.sendStatus(404);
    });
    const ext = (0, path_1.extname)(filename).replace('.', '');
    res.set({
      'Content-Type': `image/${ext}`,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new common_1.StreamableFile(file);
  }
};
__decorate(
  [
    (0, common_1.Get)(),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/user.interface').User],
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'getUsers',
  null,
);
__decorate(
  [
    (0, common_1.Get)('ladder'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/user.interface').User],
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'getUsersLadder',
  null,
);
__decorate(
  [
    (0, common_1.Get)('banned'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/user.interface').User],
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'getBannedUsers',
  null,
);
__decorate(
  [
    (0, roles_decorator_1.Roles)(
      role_enum_1.Role.ADMIN,
      role_enum_1.Role.OWNER,
    ),
    (0, common_1.UseGuards)(
      jwtTwoFactor_guard_1.JwtTwoFactorGuard,
      roles_guard_1.RolesGuard,
    ),
    (0, common_1.Get)('admins'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/user.interface').User],
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'getAdmins',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/user.interface').User,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'getUser',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/name/:username'),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/user.interface').User,
    }),
    __param(0, (0, common_1.Param)('username')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'getUserByUsername',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/login/:login'),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/user.interface').User,
    }),
    __param(0, (0, common_1.Param)('login')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'getUserByLogin',
  null,
);
__decorate(
  [
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    (0, common_1.Get)('delete/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'removeUser',
  null,
);
__decorate(
  [
    (0, roles_decorator_1.Roles)(
      role_enum_1.Role.ADMIN,
      role_enum_1.Role.OWNER,
    ),
    (0, common_1.UseGuards)(
      jwtTwoFactor_guard_1.JwtTwoFactorGuard,
      roles_guard_1.RolesGuard,
    ),
    (0, common_1.Get)('ban/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'banUser',
  null,
);
__decorate(
  [
    (0, roles_decorator_1.Roles)(
      role_enum_1.Role.ADMIN,
      role_enum_1.Role.OWNER,
    ),
    (0, common_1.UseGuards)(
      jwtTwoFactor_guard_1.JwtTwoFactorGuard,
      roles_guard_1.RolesGuard,
    ),
    (0, common_1.Get)('unban/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'unbanUser',
  null,
);
__decorate(
  [
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER),
    (0, common_1.UseGuards)(
      jwtTwoFactor_guard_1.JwtTwoFactorGuard,
      roles_guard_1.RolesGuard,
    ),
    (0, common_1.Get)('promote/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'promoteUser',
  null,
);
__decorate(
  [
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER),
    (0, common_1.UseGuards)(
      jwtTwoFactor_guard_1.JwtTwoFactorGuard,
      roles_guard_1.RolesGuard,
    ),
    (0, common_1.Get)('demote/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'demoteUser',
  null,
);
__decorate(
  [
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER),
    (0, common_1.UseGuards)(
      jwtTwoFactor_guard_1.JwtTwoFactorGuard,
      roles_guard_1.RolesGuard,
    ),
    (0, common_1.Get)('ownership/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'changeOwner',
  null,
);
__decorate(
  [
    (0, common_1.Post)('update-user'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [updateUser_dto_1.UpdateUserDto, Object]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'updateUser',
  null,
);
__decorate(
  [
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    (0, common_1.UseInterceptors)(
      (0, platform_express_1.FileInterceptor)(
        'avatar',
        files_upload_utils_1.saveImageToStorage,
      ),
    ),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  UsersController.prototype,
  'uploadFile',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/avatars/:filename'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Object]),
    __metadata('design:returntype', void 0),
  ],
  UsersController.prototype,
  'getAvatar',
  null,
);
UsersController = __decorate(
  [
    (0, swagger_1.ApiTags)('User'),
    (0, common_1.Controller)('users'),
    __metadata('design:paramtypes', [users_service_1.UsersService]),
  ],
  UsersController,
);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map
