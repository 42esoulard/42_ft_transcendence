import { Game } from 'src/pong/entity/games.entity';
import { GameStats } from 'src/pong/entity/gameStats.entity';
import { GameUser } from 'src/pong/entity/gameUser.entity';
import { Messages } from 'src/messages/entity/messages.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn, OneToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Channels } from 'src/channels/entity/channels.entity';
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
 
  @Column({ type: "varchar", length: 16, nullable: true })
  two_fa_secret: string;
  
  @Column({ default: false })
  two_fa_enabled: boolean;
  
  @Column({ type: "varchar", length: 36, nullable: true })
  refresh_token: string;
  
  @Column({nullable: true })
  expiry_date: Date;
 
  @CreateDateColumn({ type: "timestamp", default: () => "now()" })
  created_at: Date;

  @OneToOne(() => GameStats, gamestats => gamestats.user)
  gameStats: GameStats

  @OneToMany(() => GameUser, gameuser => gameuser.user)
  games: GameUser[]

  @OneToMany(() => Messages, (message) => message.author)
  messages: Messages[];

  @ManyToMany(() => Channels, (channel) => channel.members)
  @JoinTable({ name: 'channel_members' })
  channels: Channels[];

  // @OneToMany()
  // channels:

  // @ManyToMany(() => Game, game => game.participants )
  // @JoinTable({name: "playsIn"})
  // games: Game[]

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
