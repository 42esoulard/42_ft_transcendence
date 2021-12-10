import { User } from './interfaces/user.interface';
import { Repository } from 'typeorm';
import { Users } from './entity/users.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateUserTokenDto } from './dto/updateUserToken.dto';
export declare class UsersService {
  private readonly usersRepository;
  constructor(usersRepository: Repository<Users>);
  getUsers(): Promise<Users[]>;
  getUsersLadder(): Promise<Users[]>;
  getBannedUsers(): Promise<Users[]>;
  getAdmins(): Promise<Users[]>;
  getOwner(): Promise<Users[]>;
  promoteUser(id: number): Promise<import('typeorm').UpdateResult>;
  demoteUser(id: number): Promise<import('typeorm').UpdateResult>;
  getUserChannels(id: number): Promise<Users>;
  getUserbyId(id: number): Promise<Users>;
  removeUser(id: number): Promise<import('typeorm').DeleteResult>;
  getUserByUsername(username: string): Promise<User> | undefined;
  getUserByLogin(login: string): Promise<User> | undefined;
  saveUser(userDto: CreateUserDto): Promise<User> | undefined;
  changeOwner(id: number): Promise<void>;
  getRefreshToken(id: number): Promise<any>;
  banUser(id: number): Promise<import('typeorm').UpdateResult>;
  unbanUser(id: number): Promise<import('typeorm').UpdateResult>;
  updateUser(updatedUser: UpdateUserDto): Promise<void>;
  updateUserToken(updatedUser: UpdateUserTokenDto): Promise<User>;
  saveTwoFASecret(
    secret: string,
    id: number,
  ): Promise<import('typeorm').UpdateResult>;
  turnOnTwoFA(id: number): Promise<import('typeorm').UpdateResult>;
  turnOffTwoFA(id: number): Promise<import('typeorm').UpdateResult>;
}
