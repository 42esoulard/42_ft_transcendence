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

@Entity('messages')
export class Messages {
  @PrimaryGeneratedColumn()
  id: number;

  // if a channel or a user is deleted, the channel's or user's messages are deleted
  // seems like the ethical thing to do (lookin' atcha, gafams)

  @ManyToOne(() => Channels, (channel) => channel.messages, {
    onDelete: 'CASCADE',
  })
  channel: Channels;

  @ManyToOne(() => Users, (author) => author.messages, {
    onDelete: 'CASCADE',
    eager: true,
  })
  author: Users;

  @Column({ type: 'varchar', length: 100000 })
  content: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
