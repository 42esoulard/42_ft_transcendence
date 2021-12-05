import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
import { Messages } from 'src/messages/entity/messages.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('channels')
export class Channels {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @OneToMany(() => ChannelMembers, (cm) => cm.channel, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  channel_members: ChannelMembers[];

  @OneToMany(() => Messages, (message) => message.channel, {
    eager: true,
  })
  messages: Messages[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
}
