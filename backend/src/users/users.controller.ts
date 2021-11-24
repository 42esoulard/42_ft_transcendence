import {
  Controller,
  Get,
  Post,
  Put,
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
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import * as fs from 'fs';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    const users: User[] = await this.userService.getUsers();
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

  @Roles(Role.ADMIN, Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('delete/:id')
  async removeUser(@Param('id') id: number) {
    return await this.userService.removeUser(id);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('ban/:id')
  async banUser(@Param('id') id: number) {
    return await this.userService.banUser(id);
  }

  @Roles(Role.ADMIN, Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('unban/:id')
  async unbanUser(@Param('id') id: number) {
    return await this.userService.unbanUser(id);
  }

  @Roles(Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('promote/:id')
  async promoteUser(@Param('id') id: number) {
    return await this.userService.promoteUser(id);
  }

  @Roles(Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('demote/:id')
  async demoteUser(@Param('id') id: number) {
    return await this.userService.demoteUser(id);
  }

  @Roles(Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Get('ownership/:id')
  async changeOwner(@Param('id') id: number) {
    return await this.userService.changeOwner(id);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The user has been found in database',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getUser(@Param('id') id: number): Promise<User> {
    const user: User = await this.userService.getUserbyId(id);
    if (user == undefined) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('/name/:username')
  @ApiOkResponse({
    description: 'The user has been found in database',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid username supplied',
  })
  async getUserByUsername(@Param('username') username: string): Promise<User> {
    const user: User = await this.userService.getUserByUsername(username);
    if (user == undefined) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('/login/:login')
  @ApiOkResponse({
    description: 'The user has been found in database',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid login supplied',
  })
  async getUserByLogin(@Param('login') login: string): Promise<User> {
    const user: User = await this.userService.getUserByLogin(login);
    if (user == undefined) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  async saveUser(@Body() newUser: CreateUserDto): Promise<User> {
    return await this.userService.saveUser(newUser);
  }

  @Post('update-user')
  async updateUser(@Body() updatedUser: UpdateUserDto) {
    await this.userService.updateUser(updatedUser);
  }

  /**
   * Recieve user picture from frontend
   * @param file picture
   */
  @ApiCookieAuth()
  @Post('upload')
  @UseGuards(JwtTwoFactorGuard)
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  async uploadFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);
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
    // crop the avatar
    let newFilePath = file.path;
    const ext = extname(file.path);
    if (ext != '.jpg') {
      newFilePath = file.path.replace(ext, '.jpg');
      file.filename = file.filename.replace(ext, '.jpg');
      setTimeout(() => {
        fs.unlinkSync(file.path);
      }, 1000);
    }
    handleAvatar(`./${file.path}`, `./${newFilePath}`);
    // Save the URL where the file will be accessible by frontend
    this.userService.updateUser({
      id: req.user.id,
      avatar: `${process.env.BASE_URL}/users/avatars/${file.filename}`,
    });
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
  @ApiCookieAuth()
  @Get('/avatars/:imgpath')
  @UseGuards(JwtTwoFactorGuard)
  getAvatar(
    @Param('imgpath') filename: string,
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
