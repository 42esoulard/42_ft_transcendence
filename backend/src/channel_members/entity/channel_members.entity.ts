import { Channels } from 'src/channels/entity/channels.entity';
import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('channel_members')
export class ChannelMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channels, (channel) => channel.channel_members)
  channel: Channels;

  @ManyToOne(() => Users, (user) => user.channel_members)
  member: Users;

  @Column({ default: false })
  is_owner: boolean;

  @Column({ default: false })
  is_admin: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
