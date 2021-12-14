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
exports.UsersService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const users_entity_1 = require('./entity/users.entity');
const role_enum_1 = require('../auth/models/role.enum');
let UsersService = class UsersService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async getUsers() {
    return await this.usersRepository.find({ where: { banned: false } });
  }
  async getUsersLadder() {
    return await this.usersRepository.find({
      where: { banned: false },
      relations: ['games'],
    });
  }
  async getBannedUsers() {
    return await this.usersRepository.find({ where: { banned: true } });
  }
  async getAdmins() {
    return await this.usersRepository.find({
      where: [
        { role: role_enum_1.Role.ADMIN },
        { role: role_enum_1.Role.OWNER },
      ],
    });
  }
  async getOwner() {
    return await this.usersRepository.find({
      where: { role: role_enum_1.Role.OWNER },
    });
  }
  async promoteUser(id) {
    const user = await this.usersRepository.findOne(id);
    if (user.role == role_enum_1.Role.OWNER) throw common_1.ForbiddenException;
    else
      return this.usersRepository.update(id, { role: role_enum_1.Role.ADMIN });
  }
  async demoteUser(id) {
    const user = await this.usersRepository.findOne(id);
    if (user.role == role_enum_1.Role.OWNER) throw common_1.ForbiddenException;
    else
      return this.usersRepository.update(id, { role: role_enum_1.Role.USER });
  }
  async getUserChannels(id) {
    const res = await this.usersRepository.findOne(id, {
      relations: ['channels'],
    });
    return res;
  }
  async getUserbyId(id) {
    const res = await this.usersRepository.findOne(id);
    return res;
  }
  async removeUser(id) {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new common_1.BadRequestException("user doesn't exist");
    if (user.role == role_enum_1.Role.OWNER) throw common_1.ForbiddenException;
    else return await this.usersRepository.delete(user.id);
  }
  async getUserByUsername(username) {
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });
    return user;
  }
  async getUserByLogin(login) {
    const user = await this.usersRepository.findOne({
      where: { forty_two_login: login },
    });
    return user;
  }
  async saveUser(userDto) {
    const newUser = this.usersRepository.create(userDto);
    if (!newUser.avatar)
      newUser.avatar = `${process.env.BASE_URL}/users/avatars/default.jpg`;
    const createdUser = await this.usersRepository.save(newUser);
    if (createdUser.id == 1) {
      await this.usersRepository.update(createdUser.id, {
        role: role_enum_1.Role.OWNER,
      });
    }
    return createdUser;
  }
  async changeOwner(id) {
    const owner = await this.usersRepository.find({
      where: { role: role_enum_1.Role.OWNER },
    });
    const user = await this.usersRepository.findOne(id);
    await this.usersRepository.update(
      owner[0].id == id ? owner[1].id : owner[0].id,
      { role: role_enum_1.Role.ADMIN },
    );
    await this.usersRepository.update(user.id, {
      role: role_enum_1.Role.OWNER,
    });
  }
  async getRefreshToken(id) {
    const refresh_token = await this.usersRepository
      .createQueryBuilder('user')
      .select('refresh_token')
      .where('user.id = :id', { id: id })
      .getRawOne();
    return refresh_token.refresh_token;
  }
  async banUser(id) {
    const user = await this.usersRepository.findOne(id);
    if (user.role != role_enum_1.Role.USER) throw common_1.ForbiddenException;
    else
      return await this.usersRepository.update(id, {
        banned: true,
      });
  }
  async unbanUser(id) {
    return await this.usersRepository.update(id, {
      banned: false,
    });
  }
  async updateUser(updatedUser) {
    await this.usersRepository.save(updatedUser);
  }
  async updateUserToken(updatedUser) {
    return await this.usersRepository.save(updatedUser);
  }
  async saveTwoFASecret(secret, id) {
    return await this.usersRepository.update(id, {
      two_fa_secret: secret,
    });
  }
  async turnOnTwoFA(id) {
    return this.usersRepository.update(id, {
      two_fa_enabled: true,
    });
  }
  async turnOffTwoFA(id) {
    return this.usersRepository.update(id, {
      two_fa_enabled: false,
    });
  }
};
UsersService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __metadata('design:paramtypes', [typeorm_2.Repository]),
  ],
  UsersService,
);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map
