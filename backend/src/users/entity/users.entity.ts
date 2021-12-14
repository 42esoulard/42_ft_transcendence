import { Game } from 'src/pong/entity/games.entity';
import { GameUser } from 'src/pong/entity/gameUser.entity';
import { Messages } from 'src/messages/entity/messages.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Relationships } from 'src/relationships/entity/relationships.entity';
import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
import { Role } from 'src/auth/models/role.enum';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ type: 'varchar', length: 8, unique: true })
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

  @OneToMany(() => GameUser, (gameuser) => gameuser.user, {
    cascade: true,
  })
  games: GameUser[];

  @OneToMany(() => Messages, (message) => message.author)
  messages: Messages[];

  @OneToMany(() => ChannelMembers, (cm) => cm.member, {
    cascade: true,
  })
  channel_members: ChannelMembers[];

  @OneToMany(() => Relationships, (relationship) => relationship.requester)
  relationships_requested: Relationships[];

  @OneToMany(() => Relationships, (relationship) => relationship.adressee)
  relationships_adressed: Relationships[];

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
