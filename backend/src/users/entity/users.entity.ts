import { Game } from 'src/pong/entity/games.entity';
import { GameStats } from 'src/pong/entity/gameStats.entity';
import { GameUser } from 'src/pong/entity/gameUser.entity';
import { Messages } from 'src/messages/entity/messages.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Channels } from 'src/channels/entity/channels.entity';
import { Friendships } from 'src/friendships/entity/friendships.entity';
import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
// import * as bcrypt from 'bcrypt';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  forty_two_login: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  two_fa_secret: string;

  @Column({ default: false })
  two_fa_enabled: boolean;

  @Column({ default: false })
  banned: boolean;

  @Column({ type: 'varchar', length: 36, nullable: true })
  refresh_token: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  expiry_date: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @OneToOne(() => GameStats, (gamestats) => gamestats.user)
  gameStats: GameStats;

  @OneToMany(() => GameUser, (gameuser) => gameuser.user)
  games: GameUser[];

  @OneToMany(() => Messages, (message) => message.author)
  messages: Messages[];

  @OneToMany(() => ChannelMembers, (cm) => cm.member, {
    cascade: true,
  })
  channel_members: ChannelMembers[];

  @OneToMany(() => Friendships, (friendship) => friendship.requester)
  @JoinTable()
  friendships_requested: Friendships[];

  @OneToMany(() => Friendships, (friendship) => friendship.adressee)
  @JoinTable()
  friendships_adressed: Friendships[];


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
