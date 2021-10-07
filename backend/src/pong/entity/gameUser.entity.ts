import { Users } from 'src/users/entity/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, ManyToOne, PrimaryColumn, JoinTable, JoinColumn } from 'typeorm';
import { Game } from './games.entity';

@Entity('gameUser')
export class GameUser {

	@Column({ type: "boolean"})
  won: boolean;

	// automatically created by the @ManyToOne, yet we add it "explicitly" in order to be able to specify the user by id
	@PrimaryColumn({ type: "number"})
	userId: number

	@ManyToOne(() => Users, user => user.games)
	@JoinColumn(({name: 'userId'}))
	user: Users

	@ManyToOne(() => Game, game => game.users, {primary: true})
	game: Game

 
}
