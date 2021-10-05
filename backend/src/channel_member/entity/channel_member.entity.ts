import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('channels')
export class ChannelMembers {
  @PrimaryGeneratedColumn()
  channel_id: number;

  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ nullable: true })
  is_admin: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
}
