import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entity/users.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateUserTokenDto } from './dto/updateUserToken.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getUsers(): Promise<Users[]> {
    return await this.usersRepository.find({where: {banned: false}});
  }

  async getBannedUsers(): Promise<Users[]> {
    return await this.usersRepository.find({where: {banned: true}});
  }

  async getUserGames(id: number): Promise<Users> {
    const res = await this.usersRepository.findOne(id, {
      relations: ['games', 'games.game'],
    });
    return res;
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
    const user = await this.getUserbyId(id);
    return await this.usersRepository.delete(user.id);
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
      newUser.avatar = 'http://localhost:3000/users/avatars/default.jpg';
    return await this.usersRepository.save(newUser);
  }

  async getRefreshToken(id: number) {
    const refresh_token = await this.usersRepository
      .createQueryBuilder('user')
      .select('refresh_token')
      .where('user.id = :id', { id: id })
      .getRawOne();
    return refresh_token.refresh_token;
  }

  async updateUser(updatedUser: UpdateUserDto): Promise<User> {
    return await this.usersRepository.save(updatedUser);
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
