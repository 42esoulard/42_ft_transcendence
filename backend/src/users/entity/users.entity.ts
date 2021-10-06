import { Game } from 'src/pong/entity/games.entity';
import { GameStats } from 'src/pong/entity/gameStats.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn, OneToOne, ManyToMany, JoinTable } from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50, unique: true })
  username: string;
  
  @Column({ type: "varchar", length: 50, unique: true, nullable: true })
  forty_two_login: string;
  
  @Column({ type: "varchar", length: 255, nullable: true })
  avatar: string;
 
  @Column({ type: "boolean", default: false })
  two_fa: boolean;
  
  @CreateDateColumn({ type: "timestamp", default: () => "now()" })
  created_at: Date;

  @OneToOne(() => GameStats, gamestats => gamestats.user)
  gameStats: GameStats

  @ManyToMany(() => Game, game => game.participants )
  @JoinTable({name: "playsIn"})
  games: Game[]

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
