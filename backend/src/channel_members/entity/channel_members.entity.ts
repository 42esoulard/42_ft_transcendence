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

  @ManyToOne(() => Channels, (channel) => channel.channel_members, {
    onDelete: 'CASCADE',
  })
  channel: Channels;

  @ManyToOne(() => Users, (user) => user.channel_members, {
    eager: true,
    onDelete: 'CASCADE',
  })
  member: Users;

  @Column({ default: false })
  is_owner: boolean;

  @Column({ default: false })
  is_admin: boolean;

  @Column({ default: false })
  notification: boolean;

  @Column({ default: false })
  new_message: boolean;

  @Column({ length: 15, nullable: true, default: null })
  ban: string;

  @Column({ length: 15, nullable: true, default: null })
  mute: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
