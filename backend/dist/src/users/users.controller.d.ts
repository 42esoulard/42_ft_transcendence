/// <reference types="multer" />
import { StreamableFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Request, Response } from 'express';
export declare class UsersController {
  private readonly userService;
  constructor(userService: UsersService);
  getUsers(): Promise<User[]>;
  getUsersLadder(): Promise<User[]>;
  getBannedUsers(): Promise<User[]>;
  getAdmins(): Promise<User[]>;
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User>;
  getUserByLogin(login: string): Promise<User>;
  removeUser(
    id: number,
    request: Request,
  ): Promise<import('typeorm').DeleteResult>;
  banUser(id: number): Promise<import('typeorm').UpdateResult>;
  unbanUser(id: number): Promise<import('typeorm').UpdateResult>;
  promoteUser(id: number): Promise<import('typeorm').UpdateResult>;
  demoteUser(id: number): Promise<import('typeorm').UpdateResult>;
  changeOwner(id: number): Promise<void>;
  updateUser(updatedUser: UpdateUserDto, request: Request): Promise<void>;
  uploadFile(
    req: Request,
    file: Express.Multer.File,
  ): Promise<{
    message: string;
    originalname: string;
    filename: string;
  }>;
  getAvatar(filename: string, res: Response): StreamableFile;
}
