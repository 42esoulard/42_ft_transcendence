import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entity/users.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private readonly UsersRepository: Repository<Users>,
	) { }

	/**
	 * Lists all users in database
	 * nb: find() is a function from the typeORM library
	*/
	async getUsers(): Promise<User[]> {
		return await this.UsersRepository.find();
	}

	/**
	* Gets a user in database by its id
	* nb: findOne(id) is a function from the typeORM library
	*/
	async getUserbyId(id: number): Promise<User> {
		let res = await this.UsersRepository.findOne(id);
		console.log('res', res)
		return res;
	}
	
	/**
	 * Saves a new user into db after generating pw hash and salt
	 * nb: save(user) is a function from the typeORM library
	 */
	async saveUser(userDto: CreateUserDto): Promise<User> { // newUser must be of type User or CreateUserDto ??
		const newUser: User = userDto as User;
		
		newUser.salt = await bcrypt.genSalt();
		newUser.password = await bcrypt.hash(newUser.password, newUser.salt);
		
		return await this.UsersRepository.save(newUser);
	}
	
	/**
	 * Updates a user into db
	 * nb: save(user) is a function from the typeORM library
	*/
	async updateUser(updatedUser: UpdateUserDto): Promise<User> {
		return await this.UsersRepository.save(updatedUser);
	}
}
