import { Users } from 'src/users/entity/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, ManyToOne, PrimaryColumn, JoinTable } from 'typeorm';
import { Game } from './games.entity';

@Entity('gameUser')
export class GameUser {

	@Column({ type: "boolean"})
  won: boolean;

	// @PrimaryColumn()
	@ManyToOne(() => Users, user => user.games, {primary: true})
	user: Users

	// @PrimaryColumn()
	@ManyToOne(() => Game, game => game.users, {primary: true})
	game: Game

 
}
