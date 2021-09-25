import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
// import { UpdateUserDto } from './dto/updateUser.dto';

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

	// @Post()
	// @ApiCreatedResponse({
	// 	description: 'The user has been successfully updated.',
	// 	type: User,
	//   })
	// async updateUser(@Body() updatedUser : UpdateUserDto) : Promise<User> {
	// 	return await this.userService.updateUser(updatedUser);
	// }
}
