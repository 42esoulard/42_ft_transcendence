import { Controller, Get, Post, Body, Param, NotFoundException, UseInterceptors, UploadedFile, Res, StreamableFile, UseGuards, BadRequestException, Req, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../utils/files-upload.utils';
import { createReadStream } from 'fs';
import { extname, join } from 'path';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) { }

	/**
	* Lists all users in database.
	*/
	@Get()
	async getUsers(): Promise<User[]> {
		const users: User[] = await this.userService.getUsers()
		if (users == undefined) {
			throw new NotFoundException('No users in database');
		}
		return users;
	}

	/**
	* Returns a user found in database by its id.
	*/
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
		const user: User = await this.userService.getUserbyId(id)
		if (user == undefined) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	/**
	* Returns a user found in database by its username.
	*/
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
		const user: User = await this.userService.getUserByUsername(username)
		if (user == undefined) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	/**
	* Save a new user to database from the POST body
	*/
	@Post()
	async saveUser(@Body() newUser: CreateUserDto): Promise<User> {
		return await this.userService.saveUser(newUser);
	}

	/**
	 * Recieve user picture from frontend
	 * @param file picture
	 */
	@Post('upload')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
			destination: './uploads/avatars',
			filename: editFileName,
		}),
		fileFilter: imageFileFilter,
		limits: { fileSize: 1024 * 1024 } //(in bytes)
	}))
	uploadFile(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
		console.log(file);
		if (req.fileValidationError) {
			throw new BadRequestException(req.fileValidationError);
		}
		if (!file) {
			throw new BadRequestException('Invalid file');
		}
		this.userService.updateUser({ id: 1, avatar: `${process.env.BASE_URL}/users/avatars/${file.filename}` })
		const response = {
			message: 'File has been uploaded successfully',
			originalname: file.originalname,
			filename: file.filename,
		};
		return response;
	}
	
	/**
	 * Returns an avatar from its finename
	 */
	@Get('/avatars/:imgpath')
	@UseGuards(JwtAuthGuard)
	getAvatar(
		@Param('imgpath') filename: string,
		@Res({ passthrough: true }) res: Response
		) {
			const file = createReadStream(join('./uploads/avatars/', filename))
			.on('error', () => {
				// throw new NotFoundException("Avatar not found");
				res.sendStatus(404);
			})
			const ext = extname(filename).replace('.', '');
			res.set({
				'Content-Type': `image/${ext}`,
				'Content-Disposition': 'attachment; filename="avatar.png"',
		});
		return new StreamableFile(file);
	}

	// @Post()
	// @ApiCreatedResponse({
	// 	description: 'The user has been successfully updated.',
	// 	type: User,
	//   })
	// async updateUser(@Body() updatedUser : UpdateUserDto) : Promise<User> {
	// 	return await this.userService.updateUser(updatedUser);
	// }
}
