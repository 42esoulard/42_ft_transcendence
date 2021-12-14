import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  UseGuards,
  BadRequestException,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  saveImageToStorage,
  IsFileExtensionSafe,
  removeFile,
} from '../utils/files-upload.utils';
import { handleAvatar } from '../utils/files-manipulation.utils';
import { createReadStream } from 'fs';
import { extname, join } from 'path';
import { Request, Response } from 'express';
import { JwtTwoFactorGuard } from 'src/auth/guards/jwtTwoFactor.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // GETTERS

  @Get()
  async getUsers(): Promise<User[]> {
    const users: User[] = await this.userService.getUsers();
    if (users == undefined) {
      throw new NotFoundException('No users in database');
    }
    return users;
  }

  @Get('ladder')
  async getUsersLadder(): Promise<User[]> {
    const users: User[] = await this.userService.getUsersLadder();
    if (users == undefined) {
      throw new NotFoundException('No users in database');
    }
    return users;
  }

  @Get('banned')
  async getBannedUsers(): Promise<User[]> {
    const users: User[] = await this.userService.getBannedUsers();
    if (users == undefined) {
      throw new NotFoundException('No banned users in database');
    }
    return users;
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('admins')
  async getAdmins(): Promise<User[]> {
    const users: User[] = await this.userService.getAdmins();
    if (users == undefined) {
      throw new NotFoundException('No admins in database');
    }
    return users;
  }

  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User> {
    const user: User = await this.userService.getUserbyId(id);
    if (user == undefined) {
      throw new NotFoundException("User doesn't exist");
    }
    return user;
  }
  @Get('/name/:username')
  async getUserByUsername(@Param('username') username: string): Promise<User> {
    const user: User = await this.userService.getUserByUsername(username);
    if (user == undefined) {
      throw new NotFoundException("User doesn't exist");
    }
    return user;
  }

  @Get('/login/:login')
  async getUserByLogin(@Param('login') login: string): Promise<User> {
    const user: User = await this.userService.getUserByLogin(login);
    if (user == undefined) {
      throw new NotFoundException("User doesn't exist");
    }
    return user;
  }

  // SAVE-UPDATE-DELETE

  @UseGuards(JwtTwoFactorGuard)
  @Get('delete/:id')
  async removeUser(@Param('id') id: number, @Req() request: Request) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    if (request.user.id != id) {
      const reqUser = await this.userService.getUserbyId(request.user.id);
      if (reqUser && reqUser.role == 'user') {
        throw new ForbiddenException('not authorized to delete other users');
      }
    }
    return await this.userService.removeUser(id);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('ban/:id')
  async banUser(@Param('id') id: number) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.userService.banUser(id);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('unban/:id')
  async unbanUser(@Param('id') id: number) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.userService.unbanUser(id);
  }

  @Roles(Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('promote/:id')
  async promoteUser(@Param('id') id: number) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.userService.promoteUser(id);
  }

  @Roles(Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('demote/:id')
  async demoteUser(@Param('id') id: number) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.userService.demoteUser(id);
  }

  @Roles(Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('ownership/:id')
  async changeOwner(@Param('id') id: number) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.userService.changeOwner(id);
  }

  @Post('update-user')
  @UseGuards(JwtTwoFactorGuard)
  async updateUser(
    @Body() updatedUser: UpdateUserDto,
    @Req() request: Request,
  ) {
    const id = updatedUser.id;
    if (request.user.id != id) {
      const reqUser = await this.userService.getUserbyId(request.user.id);
      if (reqUser && reqUser.role == 'user') {
        throw new ForbiddenException('not authorized to update other users');
      }
    }
    if (!/^[a-zA-Z]+$/.test(updatedUser.username)) {
      throw new BadRequestException('invalid username');
    }
    const currentUser = await this.userService.getUserbyId(updatedUser.id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    if (currentUser.username != updatedUser.username) {
      if (await this.userService.getUserByUsername(updatedUser.username))
        throw new BadRequestException('username already taken');
    }
    await this.userService.updateUser(updatedUser);
  }

  /**
   * Recieve user picture from frontend
   * @param file picture
   */
  @Post('upload')
  @UseGuards(JwtTwoFactorGuard)
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  async uploadFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const currentUser = await this.userService.getUserbyId(req.user.id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    if (req.fileValidationError) {
      console.log(req.fileValidationError);
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('Invalid file');
    }
    // To check if the ext corresponds to file content
    if (!(await IsFileExtensionSafe(`./${file.path}`))) {
      removeFile(`./${file.path}`);
      throw new BadRequestException('Invalid file, hacker !?');
    }
    // crop the avatar and save it with proper name and ext
    let newFilePath = file.path.replace('_tmp', '');
    const ext = extname(file.path);
    if (ext != '.jpg') {
      newFilePath = newFilePath.replace(ext, '.jpg');
      file.filename = file.filename.replace(ext, '.jpg');
    }
    handleAvatar(`./${file.path}`, `./${newFilePath}`);

    // Save the URL where the file will be accessible by frontend
    file.filename = file.filename.replace('_tmp', '');
    this.userService.updateUser({
      id: req.user.id,
      avatar: `${process.env.BASE_URL}/users/avatars/${file.filename}`,
    });
    // Remove the tmp file
    setTimeout(() => {
      removeFile(file.path);
    }, 1000);
    const response = {
      message: 'Avatar has been uploaded successfully',
      originalname: file.originalname,
      filename: file.filename,
    };
    return response;
  }

  /**
   * Returns an avatar from its finename
   */
  @Get('/avatars/:filename')
  @UseGuards(JwtTwoFactorGuard)
  getAvatar(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = createReadStream(join('./uploads/avatars/', filename)).on(
      'error',
      () => {
        // throw new NotFoundException("Avatar not found");
        res.sendStatus(404);
      },
    );
    const ext = extname(filename).replace('.', '');
    res.set({
      'Content-Type': `image/${ext}`,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(file);
  }
}
