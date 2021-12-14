import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entity/users.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateUserTokenDto } from './dto/updateUserToken.dto';
import { Role } from 'src/auth/models/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getUsers(): Promise<Users[]> {
    return await this.usersRepository.find({ where: { banned: false } });
  }

  async getUsersLadder(): Promise<Users[]> {
    return await this.usersRepository.find({
      where: { banned: false },
      relations: ['games'],
    });
  }

  async getBannedUsers(): Promise<Users[]> {
    return await this.usersRepository.find({ where: { banned: true } });
  }

  async getAdmins(): Promise<Users[]> {
    return await this.usersRepository.find({
      where: [{ role: Role.ADMIN }, { role: Role.OWNER }],
    });
  }

  async getOwner(): Promise<Users[]> {
    return await this.usersRepository.find({ where: { role: Role.OWNER } });
  }

  //is it possible to check if requester is an admin?
  async promoteUser(id: number) {
    const user = await this.usersRepository.findOne(id);
    if (user.role == Role.OWNER) throw ForbiddenException;
    else return this.usersRepository.update(id, { role: Role.ADMIN });
  }

  async demoteUser(id: number) {
    const user = await this.usersRepository.findOne(id);
    if (user.role == Role.OWNER) throw ForbiddenException;
    else return this.usersRepository.update(id, { role: Role.USER });
  }

  async getUserChannels(id: number): Promise<Users> {
    const res = await this.usersRepository.findOne(id, {
      relations: ['channels'],
    });
    return res;
  }

  async getUserbyId(id: number): Promise<Users> {
    const res = await this.usersRepository.findOne(id);
    return res;
  }

  async removeUser(id: number) {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new BadRequestException("user doesn't exist");
    if (user.role == Role.OWNER) throw ForbiddenException;
    else return await this.usersRepository.delete(user.id);
  }

  async getUserByUsername(username: string): Promise<User> | undefined {
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });
    return user;
  }

  async getUserByLogin(login: string): Promise<User> | undefined {
    const user = await this.usersRepository.findOne({
      where: { forty_two_login: login },
    });
    return user;
  }

  async saveUser(userDto: CreateUserDto): Promise<User> | undefined {
    const newUser = this.usersRepository.create(userDto);
    if (!newUser.avatar)
      newUser.avatar = `${process.env.BASE_URL}/users/avatars/default.jpg`;
    const createdUser = await this.usersRepository.save(newUser);
    if (createdUser.id == 1) {
      await this.usersRepository.update(createdUser.id, { role: Role.OWNER });
    }
    return createdUser;
  }

  async changeOwner(id: number) {
    const owner = await this.usersRepository.find({
      where: { role: Role.OWNER },
    });
    const user = await this.usersRepository.findOne(id);

    await this.usersRepository.update(
      owner[0].id == id ? owner[1].id : owner[0].id,
      { role: Role.ADMIN },
    );
    await this.usersRepository.update(user.id, { role: Role.OWNER });
  }

  async getRefreshToken(id: number) {
    const refresh_token = await this.usersRepository
      .createQueryBuilder('user')
      .select('refresh_token')
      .where('user.id = :id', { id: id })
      .getRawOne();
    return refresh_token.refresh_token;
  }

  async banUser(id: number) {
    const user = await this.usersRepository.findOne(id);
    if (user.role != Role.USER) throw ForbiddenException;
    else
      return await this.usersRepository.update(id, {
        banned: true,
      });
  }

  async unbanUser(id: number) {
    return await this.usersRepository.update(id, {
      banned: false,
    });
  }

  async updateUser(updatedUser: UpdateUserDto) {
    await this.usersRepository.save(updatedUser);
  }

  async updateUserToken(updatedUser: UpdateUserTokenDto): Promise<User> {
    return await this.usersRepository.save(updatedUser);
  }

  async saveTwoFASecret(secret: string, id: number) {
    return await this.usersRepository.update(id, {
      two_fa_secret: secret,
    });
  }

  async turnOnTwoFA(id: number) {
    return this.usersRepository.update(id, {
      two_fa_enabled: true,
    });
  }

  async turnOffTwoFA(id: number) {
    return this.usersRepository.update(id, {
      two_fa_enabled: false,
    });
  }
}
