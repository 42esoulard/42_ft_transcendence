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
	) { }

	/**
	 * Lists all users in database
	 * nb: find() is a function from the typeORM library
	*/
	async getUsers(): Promise<User[]> | undefined {
		return await this.usersRepository.find();
	}

	/**
	* Gets a user in database by its id
	* nb: findOne(id) is a function from the typeORM library
	*/
	async getUserbyId(id: number): Promise<User> | undefined {
		let res = await this.usersRepository.findOne(id);
		console.log('res', res)
		return res;
	}

	/**
	* Gets a user in database by its username
	* 
	*/
	async getUserByUsername(username: string): Promise<User> | undefined {
		const user = await this.usersRepository
			.findOne({ where: { username: username } });
		// .createQueryBuilder("user")
		// .select()
		// .where("user.username = :username", { username: username })
		// .getRawOne();
		// console.log('getUserByUsername', user);
		return user;
	}

	/**
	 * Saves a new user into db after generating pw hash and salt
	 * nb: save(user) is a function from the typeORM library
	 */
	async saveUser(userDto: CreateUserDto): Promise<User> | undefined { // newUser must be of type User or CreateUserDto ??
		// const newUser: User = userDto as User;
		const newUser = this.usersRepository.create(userDto);
		// The following is an example to encrypt a pw, not used anymore for users
		// newUser.salt = await bcrypt.genSalt();
		// newUser.password = await bcrypt.hash(newUser.password, newUser.salt);

		return await this.usersRepository.save(newUser);
	}

	/**
	 * Updates a user into db
	 * nb: save(user) is a function from the typeORM library
	*/
	async updateUser(updatedUser: UpdateUserDto): Promise<User> {
		return await this.usersRepository.save(updatedUser);
	}
	/**
	 * Updates a user refresh_token and its expiring_date into db
	*/
	async updateUserToken(updatedUser: UpdateUserTokenDto): Promise<User> {
		return await this.usersRepository.save(updatedUser);
	}
}
