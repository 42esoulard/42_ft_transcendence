import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('channelMembers')
export class ChannelMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel_id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  is_admin: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
}
