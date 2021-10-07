import { Controller, Get, Post, Body, Param, NotFoundException, UseInterceptors, UploadedFile, Res, StreamableFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../utils/files-upload.utils';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

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
	 * Return an avatar from its path
	 */
	@Get('avatar/:imgpath')
	getAvatar(
		@Param('imgpath') path: string,
		@Res({ passthrough: true }) res: Response
		): StreamableFile {
		const file = createReadStream(join('./uploads/', path));
		res.set({
			'Content-Type': 'image/png',
			'Content-Disposition': 'attachment; filename="avatar.png"',
		});
		return new StreamableFile(file);
	}


		// @Get(':imgpath')
	// seeUploadedFile(@Param('imgpath') image, @Res() res: Response) {
	// 	return res.sendFile(image, { root: './files' });
	// }


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
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
			destination: './uploads',
			filename: editFileName,
		}),
		fileFilter: imageFileFilter,
	}))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		console.log(file);
		const response = {
			originalname: file.originalname,
			filename: file.filename,
		};
		return response;
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
